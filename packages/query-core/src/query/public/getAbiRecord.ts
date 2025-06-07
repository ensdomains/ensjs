import type { QueryOptions } from '@tanstack/query-core'

import {
  type GetAbiRecordErrorType,
  type GetAbiRecordParameters,
  type GetAbiRecordReturnType,
  getAbiRecord,
} from '../../actions/public/getAbiRecord.js'
import { filterQueryOptions } from '../utils.js'
import type { Config } from '@wagmi/core'
import type {
  Compute,
  ExactPartial,
  ScopeKeyParameter,
} from '@wagmi/core/internal'
import type { RequireConfigContracts } from '../../utils/chain.js'
import type { Chain } from 'viem'
import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'

export type GetAbiRecordOptions<config extends Config> = Compute<
  ExactPartial<GetAbiRecordParameters<config>> & ScopeKeyParameter
>

export function getAbiRecordQueryOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<chains, 'ensUniversalResolver'>,
  options: GetAbiRecordOptions<ExcludeTE<typeof config>> = {},
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    async queryFn({ queryKey }) {
      const { name, scopeKey: _, ...parameters } = queryKey[1]
      if (!name) throw new Error('name is required')
      return getAbiRecord<chains>(config, { ...parameters, name })
    },
    queryKey: getAbiRecordQueryKey(options),
  } as const satisfies QueryOptions<
    GetAbiRecordQueryFnData,
    GetAbiRecordErrorType,
    GetAbiRecordData,
    GetAbiRecordQueryKey<typeof config>
  >
}

export type GetAbiRecordQueryFnData = GetAbiRecordReturnType

export type GetAbiRecordData = GetAbiRecordQueryFnData

export function getAbiRecordQueryKey<config extends Config>(
  options: GetAbiRecordOptions<config> = {},
) {
  return ['ensjs_abiRecord', filterQueryOptions(options)] as const
}

export type GetAbiRecordQueryKey<config extends Config> = ReturnType<
  typeof getAbiRecordQueryKey<config>
>
