import type { ChainWithEns } from '@ensdomains/ensjs/contracts'
import type { ChainFormatters } from 'viem'
import type { ConfigWithEns } from './config.js'
import type { IsNarrowable, Merge } from './utils.js'

/** Filters {@link Config} chains by {@link chainId} or simplifies if no `ChainFormatters` are present. */
export type SelectChains<
  config extends ConfigWithEns,
  chainId extends config['chains'][number]['id'] | undefined = undefined,
> = ConfigWithEns extends config
  ? readonly [ChainWithEns] // chains not inferrable, return default
  : IsNarrowable<chainId, config['chains'][number]['id']> extends true
  ? readonly [Extract<config['chains'][number], { id: chainId }>] // select specific chain
  : HasFormatter<config['chains']> extends true
  ? config['chains'] // return all chains since one has formatter
  : // return default chain with ID set to union (allows for more simple type since the only thing that is different is the chain ID for each chain)
    readonly [Merge<ChainWithEns, { id: config['chains'][number]['id'] }>]

type HasFormatter<chains extends readonly ChainWithEns[]> =
  chains extends readonly [
    infer head extends ChainWithEns,
    ...infer tail extends readonly ChainWithEns[],
  ]
    ? IsNarrowable<head['formatters'], ChainFormatters | undefined> extends true
      ? true
      : HasFormatter<tail>
    : false
