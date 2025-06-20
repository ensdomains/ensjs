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
  type GetOwnerErrorType,
  type GetOwnerParameters,
  type GetOwnerReturnType,
  getOwner,
} from '../../actions/public/getOwner.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type GetOwnerOptions<config extends Config> = Compute<
  ExactPartial<GetOwnerParameters<config>> & ScopeKeyParameter
>

export function getOwnerQueryOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<
    chains,
    | 'ensNameWrapper'
    | 'ensRegistry'
    | 'ensBaseRegistrarImplementation'
    | 'multicall3'
  >,
  options: GetOwnerOptions<ExcludeTE<typeof config>> = {},
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    async queryFn({ queryKey }) {
      const { name, scopeKey: _, ...parameters } = queryKey[1]
      if (!name) throw new Error('name is required')
      return getOwner<chains>(config, { ...parameters, name })
    },
    queryKey: getOwnerQueryKey(options),
  } as const satisfies QueryOptions<
    GetOwnerQueryFnData,
    GetOwnerErrorType,
    GetOwnerData,
    GetOwnerQueryKey<typeof config>
  >
}

export type GetOwnerQueryFnData = GetOwnerReturnType

export type GetOwnerData = GetOwnerQueryFnData

export function getOwnerQueryKey<config extends Config>(
  options: GetOwnerOptions<config> = {},
) {
  return ['ensjs_owner', filterQueryOptions(options)] as const
}

export type GetOwnerQueryKey<config extends Config> = ReturnType<
  typeof getOwnerQueryKey<config>
>
