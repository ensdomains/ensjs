import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import type { QueryOptions } from '@tanstack/query-core'
import type { Config } from '@wagmi/core'
import type {
  Compute,
  ExactPartial,
  ScopeKeyParameter,
} from '@wagmi/core/internal'
import type { Chain } from 'viem'
import {
  type GetRecordsErrorType,
  type GetRecordsParameters,
  type GetRecordsReturnType,
  getRecords,
} from '../../actions/public/getRecords.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type GetRecordsOptions<
  config extends Config,
  texts extends readonly string[] | undefined = undefined,
  coins extends readonly (string | number)[] | undefined = undefined,
  contentHash extends boolean | undefined = undefined,
  abi extends boolean | undefined = undefined,
> = Compute<
  ExactPartial<GetRecordsParameters<config, texts, coins, contentHash, abi>> &
    ScopeKeyParameter
>

export function getRecordsQueryOptions<
  chains extends readonly [Chain, ...Chain[]],
  const texts extends readonly string[] | undefined = undefined,
  const coins extends readonly (string | number)[] | undefined = undefined,
  const contentHash extends boolean | undefined = undefined,
  const abi extends boolean | undefined = undefined,
>(
  config: RequireConfigContracts<chains, 'ensUniversalResolver' | 'multicall3'>,
  options: GetRecordsOptions<ExcludeTE<typeof config>> = {},
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    async queryFn({ queryKey }) {
      const { name, scopeKey: _, ...parameters } = queryKey[1]
      if (!name) throw new Error('name is required')
      return getRecords<chains, texts, coins, contentHash, abi>(config, {
        ...parameters,
        name,
      })
    },
    queryKey: getRecordsQueryKey(options),
  } as const satisfies QueryOptions<
    GetRecordsQueryFnData<texts, coins, contentHash, abi>,
    GetRecordsErrorType,
    GetRecordsData,
    GetRecordsQueryKey<typeof config>
  >
}

export type GetRecordsQueryFnData<
  texts extends readonly string[] | undefined = readonly string[],
  coins extends readonly (string | number)[] | undefined = readonly (
    | string
    | number
  )[],
  contentHash extends boolean | undefined = true,
  abi extends boolean | undefined = true,
> = GetRecordsReturnType<texts, coins, contentHash, abi>

export type GetRecordsData = GetRecordsQueryFnData

export function getRecordsQueryKey<config extends Config>(
  options: GetRecordsOptions<config> = {},
) {
  return ['ensjs_records', filterQueryOptions(options)] as const
}

export type GetRecordsQueryKey<config extends Config> = ReturnType<
  typeof getRecordsQueryKey<config>
>
