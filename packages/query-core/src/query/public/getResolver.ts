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
  type GetResolverErrorType,
  type GetResolverParameters,
  type GetResolverReturnType,
  getResolver,
} from '../../actions/public/getResolver.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type GetResolverOptions<config extends Config> = Compute<
  ExactPartial<GetResolverParameters<config>> & ScopeKeyParameter
>

export function getResolverQueryOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<chains, 'ensRegistry'>,
  options: GetResolverOptions<ExcludeTE<typeof config>> = {},
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    async queryFn({ queryKey }) {
      const { name, scopeKey: _, ...parameters } = queryKey[1]
      if (!name) throw new Error('name is required')
      return getResolver<chains>(config, { ...parameters, name })
    },
    queryKey: getResolverQueryKey(options),
  } as const satisfies QueryOptions<
    GetResolverQueryFnData,
    GetResolverErrorType,
    GetResolverData,
    GetResolverQueryKey<typeof config>
  >
}

export type GetResolverQueryFnData = GetResolverReturnType

export type GetResolverData = GetResolverQueryFnData

export function getResolverQueryKey<config extends Config>(
  options: GetResolverOptions<config> = {},
) {
  return ['ensjs_resolver', filterQueryOptions(options)] as const
}

export type GetResolverQueryKey<config extends Config> = ReturnType<
  typeof getResolverQueryKey<config>
>
