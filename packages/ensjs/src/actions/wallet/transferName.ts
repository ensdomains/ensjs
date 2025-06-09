import {
  type Account,
  type Address,
  type Chain,
  type GetChainContractAddressErrorType,
  type LabelhashErrorType,
  labelhash,
  type WriteContractErrorType,
  type WriteContractParameters,
  type WriteContractReturnType,
} from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import {
  type ChainWithContracts,
  getChainContractAddress,
  type RequireClientContracts,
} from '../../clients/chain.js'
import {
  baseRegistrarReclaimSnippet,
  baseRegistrarSafeTransferFromSnippet,
} from '../../contracts/baseRegistrar.js'
import {
  nameWrapperSafeTransferFromSnippet,
  nameWrapperSetSubnodeOwnerSnippet,
} from '../../contracts/nameWrapper.js'
import {
  registrySetOwnerSnippet,
  registrySetSubnodeOwnerSnippet,
} from '../../contracts/registry.js'
import {
  AdditionalParameterSpecifiedError,
  InvalidContractTypeError,
  UnsupportedNameTypeError,
} from '../../errors/general.js'
import type { ErrorType } from '../../errors/utils.js'
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
import { type NamehashErrorType, namehash } from '../../utils/name/namehash.js'

export type TransferNameSupportedContract =
  | 'registry'
  | 'nameWrapper'
  | 'registrar'

export type TransferNameWriteParametersParameters<
  contract extends TransferNameSupportedContract,
> = {
  /** Name to transfer */
  name: string
  /** Transfer recipient */
  newOwnerAddress: Address
  /** Contract to use for transfer */
  contract: contract
  /** Reclaim ownership as registrant (registrar only) */
  reclaim?: contract extends 'registrar' ? boolean : never
  /** Transfer name as the parent owner */
  asParent?: contract extends 'registrar' ? never : boolean
}

export type TransferNameWriteParametersErrorType =
  | AdditionalParameterSpecifiedError
  | GetChainContractAddressErrorType
  | MakeLabelNodeAndParentErrorType
  | NamehashErrorType
  | LabelhashErrorType
  | InvalidContractTypeError
  | UnsupportedNameTypeError
  | ErrorType

export const transferNameWriteParameters = <
  contract extends TransferNameSupportedContract,
  chain extends Chain,
  account extends Account,
>(
  client: RequireClientContracts<
    chain,
    'ensRegistry' | 'ensNameWrapper' | 'ensBaseRegistrarImplementation',
    account
  >,
  {
    name,
    newOwnerAddress,
    contract,
    reclaim,
    asParent,
  }: TransferNameWriteParametersParameters<contract>,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  if (reclaim && contract !== 'registrar')
    throw new AdditionalParameterSpecifiedError({
      parameter: 'reclaim',
      allowedParameters: ['name', 'newOwnerAddress', 'contract'],
      details:
        "Can't reclaim a name from any contract other than the registrar",
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
      if (asParent) {
        const { labelhash: labelhashId, parentNode } =
          makeLabelNodeAndParent(name)
        return {
          ...baseParams,
          abi: registrySetSubnodeOwnerSnippet,
          functionName: 'setSubnodeOwner',
          args: [parentNode, labelhashId, newOwnerAddress],
        } as const satisfies WriteContractParameters<
          typeof registrySetSubnodeOwnerSnippet
        >
      }

      return {
        ...baseParams,
        abi: registrySetOwnerSnippet,
        functionName: 'setOwner',
        args: [namehash(name), newOwnerAddress],
      } as const satisfies WriteContractParameters<
        typeof registrySetOwnerSnippet
      >
    }
    case 'registrar': {
      if (asParent)
        throw new AdditionalParameterSpecifiedError({
          parameter: 'asParent',
          allowedParameters: ['name', 'newOwnerAddress', 'contract', 'reclaim'],
          details: "Can't transfer a name as the parent owner on the registrar",
        })
      const nameType = getNameType(name)
      if (nameType !== 'eth-2ld')
        throw new UnsupportedNameTypeError({
          nameType,
          supportedNameTypes: ['eth-2ld'],
          details:
            'Only eth-2ld names can be transferred on the registrar contract',
        })
      const labels = name.split('.')
      const tokenId = BigInt(labelhash(labels[0]))
      const baseParams = {
        address: getChainContractAddress({
          chain: client.chain,
          contract: 'ensBaseRegistrarImplementation',
        }),
        chain: client.chain,
        account: client.account,
      }
      if (reclaim)
        return {
          ...baseParams,
          abi: baseRegistrarReclaimSnippet,
          functionName: 'reclaim',
          args: [tokenId, newOwnerAddress],
        } as const satisfies WriteContractParameters<
          typeof baseRegistrarReclaimSnippet
        >

      return {
        ...baseParams,
        abi: baseRegistrarSafeTransferFromSnippet,
        functionName: 'safeTransferFrom',
        args: [client.account.address, newOwnerAddress, tokenId],
      } as const satisfies WriteContractParameters<
        typeof baseRegistrarSafeTransferFromSnippet
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
      if (asParent) {
        const { label, parentNode } = makeLabelNodeAndParent(name)
        return {
          ...baseParams,
          abi: nameWrapperSetSubnodeOwnerSnippet,
          functionName: 'setSubnodeOwner',
          args: [parentNode, label, newOwnerAddress, 0, BigInt(0)],
        } as const satisfies WriteContractParameters<
          typeof nameWrapperSetSubnodeOwnerSnippet
        >
      }

      return {
        ...baseParams,
        abi: nameWrapperSafeTransferFromSnippet,
        functionName: 'safeTransferFrom',
        args: [
          client.account.address,
          newOwnerAddress,
          BigInt(namehash(name)),
          BigInt(1),
          '0x',
        ],
      } as const satisfies WriteContractParameters<
        typeof nameWrapperSafeTransferFromSnippet
      >
    }
    default:
      throw new InvalidContractTypeError({
        contractType: contract,
        supportedContractTypes: ['registry', 'registrar', 'nameWrapper'],
      })
  }
}

// ================================
// Action
// ================================

export type TransferNameParameters<
  contract extends 'registry' | 'nameWrapper' | 'registrar',
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<
    'ensRegistry' | 'ensNameWrapper' | 'ensBaseRegistrarImplementation'
  >,
> = Prettify<
  TransferNameWriteParametersParameters<contract> &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type TransferNameReturnType = WriteContractReturnType

export type TransferNameErrorType =
  | TransferNameWriteParametersErrorType
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Transfers a name to a new owner.
 * @param client - {@link Client}
 * @param options - {@link TransferNameOptions}
 * @returns Transaction hash. {@link TransferNameReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { transferName } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await transferName(wallet, {
 *   name: 'ens.eth',
 *   newOwnerAddress: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
 *   contract: 'registry',
 * })
 * // 0x...
 */
export async function transferName<
  contract extends TransferNameSupportedContract,
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<
    'ensRegistry' | 'ensNameWrapper' | 'ensBaseRegistrarImplementation'
  >,
>(
  client: RequireClientContracts<
    chain,
    'ensRegistry' | 'ensNameWrapper' | 'ensBaseRegistrarImplementation',
    account
  >,
  {
    name,
    newOwnerAddress,
    contract,
    reclaim,
    asParent,
    ...txArgs
  }: TransferNameParameters<contract, chain, account, chainOverride>,
): Promise<TransferNameReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = transferNameWriteParameters(
    clientWithOverrides(client, txArgs),
    {
      name,
      newOwnerAddress,
      contract,
      reclaim,
      asParent,
    } as TransferNameWriteParametersParameters<contract>,
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
