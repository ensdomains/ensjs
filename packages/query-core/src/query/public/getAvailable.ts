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
  type GetAvailableErrorType,
  type GetAvailableParameters,
  type GetAvailableReturnType,
  getAvailable,
} from '../../actions/public/getAvailable.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type GetAvailableOptions<config extends Config> = Compute<
  ExactPartial<GetAvailableParameters<config>> & ScopeKeyParameter
>

export function getAvailableQueryOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<chains, 'ensBaseRegistrarImplementation'>,
  options: GetAvailableOptions<ExcludeTE<typeof config>> = {},
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    async queryFn({ queryKey }) {
      const { name, scopeKey: _, ...parameters } = queryKey[1]
      if (!name) throw new Error('name is required')
      return getAvailable<chains>(config, { ...parameters, name })
    },
    queryKey: getAvailableQueryKey(options),
  } as const satisfies QueryOptions<
    GetAvailableQueryFnData,
    GetAvailableErrorType,
    GetAvailableData,
    GetAvailableQueryKey<typeof config>
  >
}

export type GetAvailableQueryFnData = GetAvailableReturnType

export type GetAvailableData = GetAvailableQueryFnData

export function getAvailableQueryKey<config extends Config>(
  options: GetAvailableOptions<config> = {},
) {
  return ['ensjs_available', filterQueryOptions(options)] as const
}

export type GetAvailableQueryKey<config extends Config> = ReturnType<
  typeof getAvailableQueryKey<config>
>
