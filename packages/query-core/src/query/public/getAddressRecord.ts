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
  type GetAddressRecordErrorType,
  type GetAddressRecordParameters,
  type GetAddressRecordReturnType,
  getAddressRecord,
} from '../../actions/public/getAddressRecord.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type GetAddressRecordOptions<config extends Config> = Compute<
  ExactPartial<GetAddressRecordParameters<config>> & ScopeKeyParameter
>

export function getAddressRecordQueryOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<chains, 'ensUniversalResolver'>,
  options: GetAddressRecordOptions<ExcludeTE<typeof config>> = {},
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    async queryFn({ queryKey }) {
      const { name, scopeKey: _, ...parameters } = queryKey[1]
      if (!name) throw new Error('name is required')
      return getAddressRecord<chains>(config, { ...parameters, name })
    },
    queryKey: getAddressRecordQueryKey(options),
  } as const satisfies QueryOptions<
    GetAddressRecordQueryFnData,
    GetAddressRecordErrorType,
    GetAddressRecordData,
    GetAddressRecordQueryKey<typeof config>
  >
}

export type GetAddressRecordQueryFnData = GetAddressRecordReturnType

export type GetAddressRecordData = GetAddressRecordQueryFnData

export function getAddressRecordQueryKey<config extends Config>(
  options: GetAddressRecordOptions<config> = {},
) {
  return ['ensjs_addressRecord', filterQueryOptions(options)] as const
}

export type GetAddressRecordQueryKey<config extends Config> = ReturnType<
  typeof getAddressRecordQueryKey<config>
>
