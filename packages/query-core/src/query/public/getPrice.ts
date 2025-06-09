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
  type GetPriceErrorType,
  type GetPriceParameters,
  type GetPriceReturnType,
  getPrice,
} from '../../actions/public/getPrice.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type GetPriceOptions<config extends Config> = Compute<
  ExactPartial<GetPriceParameters<config>> & ScopeKeyParameter
>

export function getPriceQueryOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<
    chains,
    'ensEthRegistrarController' | 'multicall3'
  >,
  options: GetPriceOptions<ExcludeTE<typeof config>> = {},
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    async queryFn({ queryKey }) {
      const { nameOrNames, duration, scopeKey: _, ...parameters } = queryKey[1]
      if (!nameOrNames) throw new Error('nameOrNames is required')
      if (duration === undefined) throw new Error('duration is required')
      return getPrice<chains>(config, { ...parameters, nameOrNames, duration })
    },
    queryKey: getPriceQueryKey(options),
  } as const satisfies QueryOptions<
    GetPriceQueryFnData,
    GetPriceErrorType,
    GetPriceData,
    GetPriceQueryKey<typeof config>
  >
}

export type GetPriceQueryFnData = GetPriceReturnType

export type GetPriceData = GetPriceQueryFnData

export function getPriceQueryKey<config extends Config>(
  options: GetPriceOptions<config> = {},
) {
  return ['ensjs_price', filterQueryOptions(options)] as const
}

export type GetPriceQueryKey<config extends Config> = ReturnType<
  typeof getPriceQueryKey<config>
>
