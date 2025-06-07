import type { QueryOptions } from '@tanstack/query-core'

import {
  type GetWrapperNameErrorType,
  type GetWrapperNameParameters,
  type GetWrapperNameReturnType,
  getWrapperName,
} from '../../actions/public/getWrapperName.js'
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

export type GetWrapperNameOptions<config extends Config> = Compute<
  ExactPartial<GetWrapperNameParameters<config>> & ScopeKeyParameter
>

export function getWrapperNameQueryOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<chains, 'ensNameWrapper'>,
  options: GetWrapperNameOptions<ExcludeTE<typeof config>> = {},
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    async queryFn({ queryKey }) {
      const { name, scopeKey: _, ...parameters } = queryKey[1]
      if (!name) throw new Error('name is required')
      return getWrapperName<chains>(config, { ...parameters, name })
    },
    queryKey: getWrapperNameQueryKey(options),
  } as const satisfies QueryOptions<
    GetWrapperNameQueryFnData,
    GetWrapperNameErrorType,
    GetWrapperNameData,
    GetWrapperNameQueryKey<typeof config>
  >
}

export type GetWrapperNameQueryFnData = GetWrapperNameReturnType

export type GetWrapperNameData = GetWrapperNameQueryFnData

export function getWrapperNameQueryKey<config extends Config>(
  options: GetWrapperNameOptions<config> = {},
) {
  return ['ensjs_wrapperName', filterQueryOptions(options)] as const
}

export type GetWrapperNameQueryKey<config extends Config> = ReturnType<
  typeof getWrapperNameQueryKey<config>
>
