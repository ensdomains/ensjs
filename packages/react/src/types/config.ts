import type { ChainWithEns } from '@ensdomains/ensjs/chain'
import type { ChainContract } from 'viem'
import type { Config } from 'wagmi'

/** ENS actions batch reads through multicall3, which viem chains define outside the ENS contract set */
export type ChainWithEnsAndMulticall = ChainWithEns & {
  contracts: { multicall3: ChainContract }
}

export type ConfigWithEns = Config<
  readonly [ChainWithEnsAndMulticall, ...ChainWithEnsAndMulticall[]]
>
