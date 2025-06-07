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
  type GetTextRecordErrorType,
  type GetTextRecordParameters,
  type GetTextRecordReturnType,
  getTextRecord,
} from '../../actions/public/getTextRecord.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type GetTextRecordOptions<config extends Config> = Compute<
  ExactPartial<GetTextRecordParameters<config>> & ScopeKeyParameter
>

export function getTextRecordQueryOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<chains, 'ensUniversalResolver'>,
  options: GetTextRecordOptions<ExcludeTE<typeof config>> = {},
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    async queryFn({ queryKey }) {
      const { name, key, scopeKey: _, ...parameters } = queryKey[1]
      if (!name) throw new Error('name is required')
      if (!key) throw new Error('key is required')
      return getTextRecord<chains>(config, { ...parameters, name, key })
    },
    queryKey: getTextRecordQueryKey(options),
  } as const satisfies QueryOptions<
    GetTextRecordQueryFnData,
    GetTextRecordErrorType,
    GetTextRecordData,
    GetTextRecordQueryKey<typeof config>
  >
}

export type GetTextRecordQueryFnData = GetTextRecordReturnType

export type GetTextRecordData = GetTextRecordQueryFnData

export function getTextRecordQueryKey<config extends Config>(
  options: GetTextRecordOptions<config> = {},
) {
  return ['ensjs_textRecord', filterQueryOptions(options)] as const
}

export type GetTextRecordQueryKey<config extends Config> = ReturnType<
  typeof getTextRecordQueryKey<config>
>
