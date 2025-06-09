import type { Config, CreateConnectorFn, Transport } from '@wagmi/core'
import type { SupportedContract } from '@ensdomains/ensjs/chain'
import type {
  StringConcatenationOrder,
  // biome-ignore lint/suspicious/noShadowRestrictedNames: import
  TypeError,
} from '@ensdomains/ensjs/internal'
import type { Chain } from 'viem/chains'
import type { ChainContract } from 'viem'

export type BaseChainContracts = {
  [key in keyof NonNullable<Chain['contracts']> as string extends key
    ? never
    : key]: NonNullable<Chain['contracts']>[key]
}

type SuggestedContracts =
  | SupportedContract
  | keyof BaseChainContracts
  | (string & {})

export type RequireConfigContracts<
  chains extends readonly [Chain, ...Chain[]],
  contracts extends SuggestedContracts,
  transports extends Record<chains[number]['id'], Transport> = Record<
    chains[number]['id'],
    Transport
  >,
  connectorFns extends
    readonly CreateConnectorFn[] = readonly CreateConnectorFn[],
> = chains[number] extends Chain & {
  contracts: {
    [key in contracts]: ChainContract
  }
}
  ? Config<chains, transports, connectorFns>
  : TypeError<`One of the "${chains[number]['name']}" chains are missing a required contract: ${StringConcatenationOrder<contracts, ', '>}`>

export type RequireConfigContracts2<
  config extends Config,
  contracts extends SupportedContract,
> = config extends Config<infer chains, infer transports, infer connectorFns>
  ? chains[number] extends Chain & {
      contracts: {
        [key in contracts]: ChainContract
      }
    }
    ? Config<chains, transports, connectorFns>
    : TypeError<`One of the "${chains[number]['name']}" chains are missing a required contract: ${StringConcatenationOrder<contracts, ', '>}`>
  : TypeError<`Invalid config`>
