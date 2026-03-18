import type { Account, Chain, ChainContract, Client, Transport } from 'viem'
import { getChainContractAddress as viem_getChainContractAddress } from 'viem'
// biome-ignore lint/suspicious/noShadowRestrictedNames: error type with typed message
import type { StringConcatenationOrder, TypeError } from '../types/internal.js'



export type AssertSupportedChain<
  chain extends Chain,
  supportedChain extends Chain,
  chains extends Record<PropertyKey, number>,
> = chain extends supportedChain
  ? chain
  : TypeError<`${chain['name']} is not a supported chain, supported chains are: ${StringConcatenationOrder<
      Extract<keyof chains, string>,
      ', '
    >}`>

export type BaseChainContracts = {
  [key in keyof NonNullable<Chain['contracts']> as string extends key
    ? never
    : key]: NonNullable<Chain['contracts']>[key]
}

export type SuggestedContracts<supportedContract extends string> =
  | supportedContract
  | keyof BaseChainContracts
  | (string & {})

/**
 * Type utility that explicitly enforces the presence of required contracts on the chain
 */
export type ChainWithContracts<
  supportedContract extends string,
  contracts extends SuggestedContracts<supportedContract>,
  chain extends Chain = Chain,
> = Omit<chain, 'contracts'> & {
  contracts: {
    [key in contracts]: ChainContract
  }
}

export type ExtractContracts<chain extends Chain> = NonNullable<
  chain extends {
    contracts?: infer C
  }
    ? //   ? C
      {
        [key in keyof C as string extends key ? never : key]: C[key] extends
          | ChainContract
          | undefined
          ? C[key]
          : C[key] extends { [sourceId: number]: ChainContract | undefined }
            ? C[key][keyof C[key]]
            : never
      }
    : never
>

/**
 * @see {viem_getChainContractAddress}
 */
export const getChainContractAddress = <
  const chain extends Chain,
  contracts extends ExtractContracts<chain> = ExtractContracts<chain>,
  contract extends keyof contracts = keyof contracts,
>({
  blockNumber,
  chain,
  contract,
}: {
  blockNumber?: bigint | undefined
  chain: chain
  contract: contract
}) =>
  viem_getChainContractAddress({
    chain,
    contract: contract as string,
    blockNumber,
  }) as contracts[contract] extends ChainContract
    ? contracts[contract]['address']
    : never

/**
 * Type utility that enforces required contract dependencies on the client while providing clear error messages
 * @example
 * ```ts
 * // Action definition
 * const myAction = async <chain extends Chain>(
 *   client: RequireClientContracts<chain, 'ensPublicResolver'>,
 * ) => { ... }
 *
 * // Example clients
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const clientWithensL1Contracts = createPublicClient({
 *   // This adds the required contracts to the chain
 *   chain: extendChainWithEns(mainnet),
 *   transport: http(),
 * })
 *
 * // This will error
 * myAction(client) // TypeError<'Chain "mainnet" is missing required contracts: ensPublicResolver'>
 *
 * // This will not error
 * myAction(clientWithensL1Contracts)
 * ```
 */
export type RequireClientContracts<
  supportedContract extends string,
  chain extends Chain,
  contracts extends SuggestedContracts<supportedContract>,
  account extends Account | undefined = Account | undefined,
> = chain extends Omit<Chain, 'contracts'> & {
  contracts: {
    [key in contracts]: ChainContract
  }
}
  ? Client<Transport, chain, account>
  : TypeError<`Chain "${chain['name']}" is missing required contracts: ${StringConcatenationOrder<contracts, ', '>}`>
