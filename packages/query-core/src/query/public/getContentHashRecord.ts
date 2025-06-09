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
  type GetContentHashRecordErrorType,
  type GetContentHashRecordParameters,
  type GetContentHashRecordReturnType,
  getContentHashRecord,
} from '../../actions/public/getContentHashRecord.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type GetContentHashRecordOptions<config extends Config> = Compute<
  ExactPartial<GetContentHashRecordParameters<config>> & ScopeKeyParameter
>

export function getContentHashRecordQueryOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<chains, 'ensUniversalResolver'>,
  options: GetContentHashRecordOptions<ExcludeTE<typeof config>> = {},
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    async queryFn({ queryKey }) {
      const { name, scopeKey: _, ...parameters } = queryKey[1]
      if (!name) throw new Error('name is required')
      return getContentHashRecord<chains>(config, { ...parameters, name })
    },
    queryKey: getContentHashRecordQueryKey(options),
  } as const satisfies QueryOptions<
    GetContentHashRecordQueryFnData,
    GetContentHashRecordErrorType,
    GetContentHashRecordData,
    GetContentHashRecordQueryKey<typeof config>
  >
}

export type GetContentHashRecordQueryFnData = GetContentHashRecordReturnType

export type GetContentHashRecordData = GetContentHashRecordQueryFnData

export function getContentHashRecordQueryKey<config extends Config>(
  options: GetContentHashRecordOptions<config> = {},
) {
  return ['ensjs_contentHashRecord', filterQueryOptions(options)] as const
}

export type GetContentHashRecordQueryKey<config extends Config> = ReturnType<
  typeof getContentHashRecordQueryKey<config>
>
