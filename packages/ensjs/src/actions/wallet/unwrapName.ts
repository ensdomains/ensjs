import {
  type Account,
  type Address,
  type Chain,
  type Client,
  type GetChainContractAddressErrorType,
  type Hash,
  type LabelhashErrorType,
  type Transport,
  type WriteContractErrorType,
  type WriteContractParameters,
} from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import type { ChainWithContract } from '../../contracts/consts.js'
import {
  nameWrapperUnwrapEth2ldSnippet,
  nameWrapperUnwrapSnippet,
} from '../../contracts/nameWrapper.js'
import {
  AdditionalParameterSpecifiedError,
  RequiredParameterNotSpecifiedError,
} from '../../errors/general.js'
import type {
  Eth2ldNameSpecifier,
  GetNameType,
  WriteTransactionParameters,
} from '../../types/index.js'
import {
  clientWithOverrides,
  type ClientWithOverridesErrorType,
} from '../../utils/clientWithOverrides.js'
import { getNameType } from '../../utils/name/getNameType.js'
import {
  makeLabelNodeAndParent,
  type MakeLabelNodeAndParentErrorType,
} from '../../utils/name/makeLabelNodeAndParent.js'
import {
  getChainContractAddress,
  type ChainWithContracts,
  type RequireClientContracts,
} from '../../clients/chain.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'
import type { ErrorType } from '../../errors/utils.js'

export type UnwrapNameWriteParametersParameters<name extends string> = {
  /** The name to unwrap */
  name: name
  /** The recipient of the unwrapped name */
  newOwnerAddress: Address
  /** The registrant of the unwrapped name (eth-2ld only) */
  newRegistrantAddress?: Address
} & (GetNameType<name> extends Eth2ldNameSpecifier
  ? {
      newRegistrantAddress: Address
    }
  : {
      newRegistrantAddress?: never
    })

// type ChainWithContractDependencies = ChainWithContract<"ensNameWrapper">;

export type UnwrapNameWriteParametersErrorType =
  | MakeLabelNodeAndParentErrorType
  | AdditionalParameterSpecifiedError
  | RequiredParameterNotSpecifiedError
  | GetChainContractAddressErrorType
  | ErrorType

export const unwrapNameWriteParameters = <
  name extends string,
  chain extends Chain,
  account extends Account,
>(
  client: RequireClientContracts<chain, 'ensNameWrapper', account>,
  {
    name,
    newOwnerAddress,
    newRegistrantAddress,
  }: UnwrapNameWriteParametersParameters<name>,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const { labelhash, parentNode } = makeLabelNodeAndParent(name)
  const nameWrapperAddress = getChainContractAddress({
    chain: client.chain,
    contract: 'ensNameWrapper',
  })
  const nameType = getNameType(name)

  if (nameType === 'eth-2ld') {
    if (!newRegistrantAddress)
      throw new RequiredParameterNotSpecifiedError({
        parameter: 'newRegistrantAddress',
        details: 'Must provide newRegistrantAddress for eth-2ld names',
      })

    return {
      address: nameWrapperAddress,
      abi: nameWrapperUnwrapEth2ldSnippet,
      functionName: 'unwrapETH2LD',
      args: [labelhash, newRegistrantAddress, newOwnerAddress],
      chain: client.chain,
      account: client.account,
    } as const satisfies WriteContractParameters<
      typeof nameWrapperUnwrapEth2ldSnippet
    >
  }

  if (newRegistrantAddress)
    throw new AdditionalParameterSpecifiedError({
      parameter: 'newRegistrantAddress',
      allowedParameters: ['name', 'newOwnerAddress'],
      details: 'newRegistrantAddress can only be specified for eth-2ld names',
    })

  return {
    address: nameWrapperAddress,
    abi: nameWrapperUnwrapSnippet,
    functionName: 'unwrap',
    args: [parentNode, labelhash, newOwnerAddress],
    chain: client.chain,
    account: client.account,
  } as const satisfies WriteContractParameters<typeof nameWrapperUnwrapSnippet>
}

// ================================
// Action
// ================================

export type UnwrapNameParameters<
  name extends string,
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<'ensNameWrapper'>,
> = UnwrapNameWriteParametersParameters<name> &
  WriteTransactionParameters<chain, account, chainOverride>

export type UnwrapNameReturnType = Hash

export type UnwrapNameErrorType =
  | UnwrapNameWriteParametersErrorType
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Unwraps a name.
 * @param client - {@link Client}
 * @param options - {@link UnwrapNameParameters}
 * @returns Transaction hash. {@link UnwrapNameReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { unwrapName } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await unwrapName(wallet, {
 *   name: 'example.eth',
 *   newOwnerAddress: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
 *   newRegistrantAddress: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
 * })
 * // 0x...
 */
export async function unwrapName<
  name extends string,
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<'ensNameWrapper'>,
>(
  client: RequireClientContracts<chain, 'ensNameWrapper', account>,
  {
    name,
    newOwnerAddress,
    newRegistrantAddress,
    ...txArgs
  }: UnwrapNameParameters<name, chain, account, chainOverride>,
): Promise<UnwrapNameReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = unwrapNameWriteParameters(
    clientWithOverrides(client, txArgs),
    {
      name,
      newOwnerAddress,
      newRegistrantAddress,
    } as UnwrapNameWriteParametersParameters<name>,
  )
  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
