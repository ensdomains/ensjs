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
  type GetExpiryErrorType,
  type GetExpiryParameters,
  type GetExpiryReturnType,
  getExpiry,
} from '../../actions/public/getExpiry.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type GetExpiryOptions<config extends Config> = Compute<
  ExactPartial<GetExpiryParameters<config>> & ScopeKeyParameter
>

export function getExpiryQueryOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<
    chains,
    'ensNameWrapper' | 'ensBaseRegistrarImplementation' | 'multicall3'
  >,
  options: GetExpiryOptions<ExcludeTE<typeof config>> = {},
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    async queryFn({ queryKey }) {
      const { name, scopeKey: _, ...parameters } = queryKey[1]
      if (!name) throw new Error('name is required')
      return getExpiry<chains>(config, { ...parameters, name })
    },
    queryKey: getExpiryQueryKey(options),
  } as const satisfies QueryOptions<
    GetExpiryQueryFnData,
    GetExpiryErrorType,
    GetExpiryData,
    GetExpiryQueryKey<typeof config>
  >
}

export type GetExpiryQueryFnData = GetExpiryReturnType

export type GetExpiryData = GetExpiryQueryFnData

export function getExpiryQueryKey<config extends Config>(
  options: GetExpiryOptions<config> = {},
) {
  return ['ensjs_expiry', filterQueryOptions(options)] as const
}

export type GetExpiryQueryKey<config extends Config> = ReturnType<
  typeof getExpiryQueryKey<config>
>
