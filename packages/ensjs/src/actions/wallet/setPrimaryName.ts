import type {
  Account,
  Address,
  Chain,
  GetChainContractAddressErrorType,
  Hash,
  WriteContractErrorType,
  WriteContractParameters,
} from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import {
  type ChainWithContracts,
  getChainContractAddress,
  type RequireClientContracts,
} from '../../clients/chain.js'
import {
  reverseRegistrarSetNameForAddrSnippet,
  reverseRegistrarSetNameSnippet,
} from '../../contracts/reverseRegistrar.js'
import type { Prettify, WriteTransactionParameters } from '../../types/index.js'
import {
  ASSERT_NO_TYPE_ERROR,
  EXCLUDE_TYPE_ERROR,
} from '../../types/internal.js'
import { clientWithOverrides } from '../../utils/clientWithOverrides.js'

// ================================
// Write parameters
// ================================

type BaseSetPrimaryNameDataParameters = {
  /** The name to set as primary */
  name: string
  /** The address to set the primary name for */
  address?: Address
  /** The resolver address to use */
  resolverAddress?: Address
}

type SelfSetPrimaryNameDataParameters = {
  address?: never
  resolverAddress?: never
}

type OtherSetPrimaryNameDataParameters = {
  address: Address
  resolverAddress?: Address
}

export type SetPrimaryNameWriteParametersParameters =
  BaseSetPrimaryNameDataParameters &
    (SelfSetPrimaryNameDataParameters | OtherSetPrimaryNameDataParameters)

export type SetPrimaryNameWriteParametersReturnType = ReturnType<
  typeof setPrimaryNameWriteParameters
>

export type SetPrimaryNameWriteParametersErrorType =
  GetChainContractAddressErrorType

export const setPrimaryNameWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: RequireClientContracts<
    chain,
    'ensPublicResolver' | 'ensReverseRegistrar',
    account
  >,
  {
    name,
    address,
    resolverAddress = getChainContractAddress({
      chain: EXCLUDE_TYPE_ERROR(client).chain,
      contract: 'ensPublicResolver',
    }),
  }: SetPrimaryNameWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const reverseRegistrarAddress = getChainContractAddress({
    chain: client.chain,
    contract: 'ensReverseRegistrar',
  })

  const baseParams = {
    address: reverseRegistrarAddress,
    account: client.account,
    chain: client.chain,
  } as const

  if (address)
    return {
      ...baseParams,
      abi: reverseRegistrarSetNameForAddrSnippet,
      functionName: 'setNameForAddr',
      args: [address, client.account.address, resolverAddress, name],
    } as const satisfies WriteContractParameters<
      typeof reverseRegistrarSetNameForAddrSnippet
    >

  return {
    ...baseParams,
    abi: reverseRegistrarSetNameSnippet,
    functionName: 'setName',
    args: [name],
  } as const satisfies WriteContractParameters<
    typeof reverseRegistrarSetNameSnippet
  >
}

// ================================
// Action
// ================================

export type SetPrimaryNameParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<
    'ensPublicResolver' | 'ensReverseRegistrar'
  >,
> = Prettify<
  SetPrimaryNameWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type SetPrimaryNameReturnType = Hash

export type SetPrimaryNameErrorType =
  | SetPrimaryNameWriteParametersErrorType
  | WriteContractErrorType

/**
 * Sets a primary name for an address.
 * @param client - {@link Client}
 * @param options - {@link SetPrimaryNameOptions}
 * @returns Transaction hash. {@link SetPrimaryNameReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { setPrimaryName } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
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
  chainOverride extends ChainWithContracts<
    'ensPublicResolver' | 'ensReverseRegistrar'
  >,
>(
  client: RequireClientContracts<
    chain,
    'ensPublicResolver' | 'ensReverseRegistrar',
    account
  >,
  {
    name,
    address,
    resolverAddress,
    ...txArgs
  }: SetPrimaryNameParameters<chain, account, chainOverride>,
): Promise<SetPrimaryNameReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = setPrimaryNameWriteParameters(
    clientWithOverrides(client, txArgs),
    {
      name,
      address,
      resolverAddress,
    } as SetPrimaryNameWriteParametersParameters,
  )
  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
