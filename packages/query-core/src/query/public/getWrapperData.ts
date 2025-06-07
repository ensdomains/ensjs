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
  type GetWrapperDataErrorType,
  type GetWrapperDataParameters,
  type GetWrapperDataReturnType,
  getWrapperData,
} from '../../actions/public/getWrapperData.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type GetWrapperDataOptions<config extends Config> = Compute<
  ExactPartial<GetWrapperDataParameters<config>> & ScopeKeyParameter
>

export function getWrapperDataQueryOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<chains, 'ensNameWrapper' | 'multicall3'>,
  options: GetWrapperDataOptions<ExcludeTE<typeof config>> = {},
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    async queryFn({ queryKey }) {
      const { name, scopeKey: _, ...parameters } = queryKey[1]
      if (!name) throw new Error('name is required')
      return getWrapperData<chains>(config, { ...parameters, name })
    },
    queryKey: getWrapperDataQueryKey(options),
  } as const satisfies QueryOptions<
    GetWrapperDataQueryFnData,
    GetWrapperDataErrorType,
    GetWrapperDataData,
    GetWrapperDataQueryKey<typeof config>
  >
}

export type GetWrapperDataQueryFnData = GetWrapperDataReturnType

export type GetWrapperDataData = GetWrapperDataQueryFnData

export function getWrapperDataQueryKey<config extends Config>(
  options: GetWrapperDataOptions<config> = {},
) {
  return ['ensjs_wrapperData', filterQueryOptions(options)] as const
}

export type GetWrapperDataQueryKey<config extends Config> = ReturnType<
  typeof getWrapperDataQueryKey<config>
>
