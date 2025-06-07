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
  type GetNameErrorType,
  type GetNameParameters,
  type GetNameReturnType,
  getName,
} from '../../actions/public/getName.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type GetNameOptions<config extends Config> = Compute<
  ExactPartial<GetNameParameters<config>> & ScopeKeyParameter
>

export function getNameQueryOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<chains, 'ensUniversalResolver'>,
  options: GetNameOptions<ExcludeTE<typeof config>> = {},
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    async queryFn({ queryKey }) {
      const { address, scopeKey: _, ...parameters } = queryKey[1]
      if (!address) throw new Error('address is required')
      return getName<chains>(config, { ...parameters, address })
    },
    queryKey: getNameQueryKey(options),
  } as const satisfies QueryOptions<
    GetNameQueryFnData,
    GetNameErrorType,
    GetNameData,
    GetNameQueryKey<typeof config>
  >
}

export type GetNameQueryFnData = GetNameReturnType

export type GetNameData = GetNameQueryFnData

export function getNameQueryKey<config extends Config>(
  options: GetNameOptions<config> = {},
) {
  return ['ensjs_name', filterQueryOptions(options)] as const
}

export type GetNameQueryKey<config extends Config> = ReturnType<
  typeof getNameQueryKey<config>
>
