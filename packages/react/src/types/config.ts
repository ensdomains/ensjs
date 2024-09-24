import type { ChainWithEns } from '@ensdomains/ensjs/contracts'
import type { Config } from 'wagmi'

export type ConfigWithEns = Config<readonly [ChainWithEns, ...ChainWithEns[]]>
