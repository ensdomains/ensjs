import {
  type GetRecordsErrorType as ensjs_GetRecordsErrorType,
  type GetRecordsParameters as ensjs_GetRecordsParameters,
  type GetRecordsReturnType as ensjs_GetRecordsReturnType,
  getRecords as ensjs_getRecords,
} from '@ensdomains/ensjs/public'
import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import type { Config } from '@wagmi/core'
import type { ChainIdParameter } from '@wagmi/core/internal'
import type { Chain, Prettify } from 'viem'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { getAction } from '../../utils/getAction.js'

export type GetRecordsParameters<
  config extends Config = Config,
  texts extends readonly string[] | undefined = readonly string[],
  coins extends readonly (string | number)[] | undefined = readonly (
    | string
    | number
  )[],
  contentHash extends boolean | undefined = true,
  abi extends boolean | undefined = true,
> = Prettify<
  ensjs_GetRecordsParameters<texts, coins, contentHash, abi> &
    ChainIdParameter<config>
>

export type GetRecordsReturnType<
  texts extends readonly string[] | undefined = readonly string[],
  coins extends readonly (string | number)[] | undefined = readonly (
    | string
    | number
  )[],
  contentHash extends boolean | undefined = true,
  abi extends boolean | undefined = true,
> = ensjs_GetRecordsReturnType<texts, coins, contentHash, abi>

export type GetRecordsErrorType = ensjs_GetRecordsErrorType

export function getRecords<
  chains extends readonly [Chain, ...Chain[]],
  const texts extends readonly string[] | undefined = undefined,
  const coins extends readonly (string | number)[] | undefined = undefined,
  const contentHash extends boolean | undefined = undefined,
  const abi extends boolean | undefined = undefined,
>(
  config: RequireConfigContracts<chains, 'ensUniversalResolver' | 'multicall3'>,
  parameters: GetRecordsParameters<
    ExcludeTE<typeof config>,
    texts,
    coins,
    contentHash,
    abi
  >,
): Promise<GetRecordsReturnType<texts, coins, contentHash, abi>> {
  ASSERT_NO_TYPE_ERROR(config)

  const { chainId, ...rest } = parameters
  const client = config.getClient({ chainId })
  const action = getAction(
    client,
    ensjs_getRecords<typeof client.chain, texts, coins, contentHash, abi>,
    'getRecords',
  )
  return action(rest)
}
