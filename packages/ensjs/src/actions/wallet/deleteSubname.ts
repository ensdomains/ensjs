import {
  type Account,
  type Chain,
  type GetChainContractAddressErrorType,
  type Hash,
  type NamehashErrorType,
  namehash,
  type WriteContractErrorType,
  type WriteContractParameters,
  zeroAddress,
} from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import {
  type ChainWithContracts,
  getChainContractAddress,
  type RequireClientContracts,
} from '../../clients/chain.js'
import {
  nameWrapperSetRecordSnippet,
  nameWrapperSetSubnodeRecordSnippet,
} from '../../contracts/nameWrapper.js'
import {
  registrySetRecordSnippet,
  registrySetSubnodeRecordSnippet,
} from '../../contracts/registry.js'
import {
  InvalidContractTypeError,
  UnsupportedNameTypeError,
} from '../../errors/general.js'
import type { Prettify, WriteTransactionParameters } from '../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../utils/clientWithOverrides.js'
import { getNameType } from '../../utils/name/getNameType.js'
import {
  type MakeLabelNodeAndParentErrorType,
  makeLabelNodeAndParent,
} from '../../utils/name/makeLabelNodeAndParent.js'

// ================================
// Write parameters
// ================================

export type DeleteSubnameWriteParametersParameters = {
  /** Subname to delete */
  name: string
  /** Contract to delete subname on */
  contract: 'registry' | 'nameWrapper'
  /** If true, deletes via owner methods, otherwise will delete via parent owner methods */
  asOwner?: boolean
}

export type DeleteSubnameWriteParametersReturnType = ReturnType<
  typeof deleteSubnameWriteParameters
>

export type DeleteSubnameWriteParametersErrorType =
  | UnsupportedNameTypeError
  | GetChainContractAddressErrorType
  | NamehashErrorType
  | MakeLabelNodeAndParentErrorType
  | InvalidContractTypeError

export const deleteSubnameWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: RequireClientContracts<
    chain,
    'ensRegistry' | 'ensNameWrapper',
    account
  >,
  { name, contract, asOwner }: DeleteSubnameWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const nameType = getNameType(name)
  if (nameType !== 'eth-subname' && nameType !== 'other-subname')
    throw new UnsupportedNameTypeError({
      nameType,
      supportedNameTypes: ['eth-subname', 'other-subname'],
      details: 'Cannot delete a name that is not a subname',
    })

  switch (contract) {
    case 'registry': {
      const baseParams = {
        address: getChainContractAddress({
          chain: client.chain,
          contract: 'ensRegistry',
        }),
        chain: client.chain,
        account: client.account,
      } as const
      if (asOwner)
        return {
          ...baseParams,
          abi: registrySetRecordSnippet,
          functionName: 'setRecord',
          args: [namehash(name), zeroAddress, zeroAddress, BigInt(0)],
        } as const satisfies WriteContractParameters<
          typeof registrySetRecordSnippet
        >

      const { labelhash, parentNode } = makeLabelNodeAndParent(name)
      return {
        ...baseParams,
        abi: registrySetSubnodeRecordSnippet,
        functionName: 'setSubnodeRecord',
        args: [parentNode, labelhash, zeroAddress, zeroAddress, BigInt(0)],
      } as const satisfies WriteContractParameters<
        typeof registrySetSubnodeRecordSnippet
      >
    }
    case 'nameWrapper': {
      const baseParams = {
        address: getChainContractAddress({
          chain: client.chain,
          contract: 'ensNameWrapper',
        }),
        chain: client.chain,
        account: client.account,
      } as const
      if (asOwner)
        return {
          ...baseParams,
          abi: nameWrapperSetRecordSnippet,
          functionName: 'setRecord',
          args: [namehash(name), zeroAddress, zeroAddress, BigInt(0)],
        } as const satisfies WriteContractParameters<
          typeof nameWrapperSetRecordSnippet
        >

      const { label, parentNode } = makeLabelNodeAndParent(name)
      return {
        ...baseParams,
        abi: nameWrapperSetSubnodeRecordSnippet,
        functionName: 'setSubnodeRecord',
        args: [
          parentNode,
          label,
          zeroAddress,
          zeroAddress,
          BigInt(0),
          0,
          BigInt(0),
        ],
      } as const satisfies WriteContractParameters<
        typeof nameWrapperSetSubnodeRecordSnippet
      >
    }
    default:
      throw new InvalidContractTypeError({
        contractType: contract,
        supportedContractTypes: ['registry', 'nameWrapper'],
      })
  }
}

// ================================
// Delete subname action
// ================================

export type DeleteSubnameParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends
    | ChainWithContracts<'ensRegistry' | 'ensNameWrapper'>
    | undefined,
> = Prettify<
  DeleteSubnameWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type DeleteSubnameReturnType = Hash

export type DeleteSubnameErrorType =
  | DeleteSubnameWriteParametersErrorType
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Deletes a subname
 * @param client - {@link Client}
 * @param options - {@link DeleteSubnameOptions}
 * @returns Transaction hash. {@link DeleteSubnameReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { deleteSubname } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: mainnetWithEns,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await deleteSubname(wallet, {
 *   name: 'sub.ens.eth',
 *   contract: 'registry',
 * })
 * // 0x...
 */
export async function deleteSubname<
  chain extends Chain,
  account extends Account,
  chainOverride extends
    | ChainWithContracts<'ensRegistry' | 'ensNameWrapper'>
    | undefined,
>(
  client: RequireClientContracts<
    chain,
    'ensRegistry' | 'ensNameWrapper',
    account
  >,
  {
    name,
    contract,
    asOwner,
    ...txArgs
  }: DeleteSubnameParameters<chain, account, chainOverride>,
): Promise<DeleteSubnameReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const data = deleteSubnameWriteParameters(
    clientWithOverrides(client, txArgs),
    {
      name,
      contract,
      asOwner,
    },
  )
  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...data,
    ...txArgs,
  } as WriteContractParameters)
}
