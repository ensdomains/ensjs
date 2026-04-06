import type {
  Account,
  Address,
  Chain,
  Hash,
  WriteContractErrorType,
  WriteContractParameters,
} from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import type {
  ChainWithContracts,
  RequireClientContracts,
} from '../../../clients/shared.js'
import { getChainContractAddress } from '../../../clients/shared.js'
import {
  defaultReverseRegistrarSetNameForAddrSnippet,
  defaultReverseRegistrarSetNameSnippet,
} from '../../../contracts/defaultReverseRegistrar.js'
import type {
  Prettify,
  WriteTransactionParameters,
} from '../../../types/index.js'
import {
  ASSERT_NO_TYPE_ERROR,
  EXCLUDE_TYPE_ERROR,
} from '../../../types/internal.js'
import { clientWithOverrides } from '../../../utils/clientWithOverrides.js'

// ================================
// Write parameters
// ================================

type BaseSetPrimaryNameDataParameters = {
  /** The name to set as primary */
  name: string
  /** The address to set the primary name for */
  address?: Address
}

type SelfSetPrimaryNameDataParameters = {
  address?: never
}

type OtherSetPrimaryNameDataParameters = {
  address: Address
}

export type SetPrimaryNameWriteParametersParameters =
  BaseSetPrimaryNameDataParameters &
    (SelfSetPrimaryNameDataParameters | OtherSetPrimaryNameDataParameters)

export type SetPrimaryNameWriteParametersReturnType = ReturnType<
  typeof setPrimaryNameWriteParameters
>

export type SetPrimaryNameV2WriteParametersReturnType =
  SetPrimaryNameWriteParametersReturnType

export type SetPrimaryNameWriteParametersErrorType = never

export const setPrimaryNameWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: RequireClientContracts<chain, 'ensDefaultReverseRegistrar', account>,
  { name, address }: SetPrimaryNameWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const defaultReverseRegistrarAddress = getChainContractAddress({
    chain: EXCLUDE_TYPE_ERROR(client).chain,
    contract: 'ensDefaultReverseRegistrar',
  })

  const baseParams = {
    address: defaultReverseRegistrarAddress,
    account: client.account,
    chain: client.chain,
  } as const

  if (address)
    return {
      ...baseParams,
      abi: defaultReverseRegistrarSetNameForAddrSnippet,
      functionName: 'setNameForAddr',
      args: [address, name],
    } as const satisfies WriteContractParameters<
      typeof defaultReverseRegistrarSetNameForAddrSnippet
    >

  return {
    ...baseParams,
    abi: defaultReverseRegistrarSetNameSnippet,
    functionName: 'setName',
    args: [name],
  } as const satisfies WriteContractParameters<
    typeof defaultReverseRegistrarSetNameSnippet
  >
}

// ================================
// Action
// ================================

export type SetPrimaryNameParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<'ensDefaultReverseRegistrar'>,
> = Prettify<
  SetPrimaryNameWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type SetPrimaryNameReturnType = Hash

export type SetPrimaryNameErrorType =
  | SetPrimaryNameWriteParametersErrorType
  | WriteContractErrorType

/**
 * Sets a primary name for an address using the v2 DefaultReverseRegistrar.
 * @param client - {@link Client}
 * @param parameters - {@link SetPrimaryNameParameters}
 * @returns Transaction hash. {@link SetPrimaryNameReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { sepolia } from 'viem/chains'
 * import { extendChainWithL2Ens } from '@ensdomains/ensjs/chain'
 * import { setPrimaryName } from '@ensdomains/ensjs/wallet/v2'
 *
 * const wallet = createWalletClient({
 *   chain: extendChainWithL2Ens(sepolia),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await setPrimaryName(wallet, {
 *   name: 'ens.eth',
 * })
 * // 0x...
 */
export async function setPrimaryName<
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<'ensDefaultReverseRegistrar'>,
>(
  client: RequireClientContracts<chain, 'ensDefaultReverseRegistrar', account>,
  {
    name,
    address,
    ...txArgs
  }: SetPrimaryNameParameters<chain, account, chainOverride>,
): Promise<SetPrimaryNameReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = setPrimaryNameWriteParameters(
    clientWithOverrides(client, txArgs),
    { name, address } as SetPrimaryNameWriteParametersParameters,
  )
  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
