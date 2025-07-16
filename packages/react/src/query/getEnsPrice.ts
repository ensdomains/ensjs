import {
  type GetPriceErrorType as ensjs_GetEnsPriceErrorType,
  type GetPriceParameters as ensjs_GetEnsPriceParameters,
  type GetPriceReturnType as ensjs_GetEnsPriceReturnType,
  getPrice,
} from '@ensdomains/ensjs/public'
import type { QueryOptions } from '@tanstack/react-query'
import type { ConfigWithEns } from '../types/config.js'
import type {
  ChainIdParameter,
  ScopeKeyParameter,
} from '../types/properties.js'
import type { Compute, ExactPartial } from '../types/utils.js'
import { filterQueryOptions, getClientAndParameters } from './utils.js'

export type GetEnsPriceParameters<
  config extends ConfigWithEns = ConfigWithEns,
> = Compute<ensjs_GetEnsPriceParameters & ChainIdParameter<config>>

export type GetEnsPriceReturnType = ensjs_GetEnsPriceReturnType

export type GetEnsPriceErrorType = ensjs_GetEnsPriceErrorType

export type GetEnsPriceOptions<config extends ConfigWithEns = ConfigWithEns> =
  Compute<ExactPartial<GetEnsPriceParameters<config>> & ScopeKeyParameter>

export type GetEnsPriceQueryFnData = GetEnsPriceReturnType

export type GetEnsPriceData = GetEnsPriceReturnType

export const getEnsPriceQueryKey = <config extends ConfigWithEns>(
  options: GetEnsPriceOptions<config>,
) => {
  return ['getEnsPrice', filterQueryOptions(options)] as const
}

export type GetEnsPriceQueryKey<config extends ConfigWithEns> = ReturnType<
  typeof getEnsPriceQueryKey<config>
>

export const getEnsPriceQueryOptions = <config extends ConfigWithEns>(
  config: config,
  options: GetEnsPriceOptions<config> = {},
) => {
  return {
    async queryFn({ queryKey }) {
      const { nameOrNames, duration, ...rest } = queryKey[1]
      if (!nameOrNames) throw new Error('nameOrNames is required')
      if (!duration) throw new Error('duration is required')

      const { client, parameters } = getClientAndParameters(config, {
        ...rest,
        nameOrNames,
        duration,
      })
      return getPrice(client, parameters)
    },
    queryKey: getEnsPriceQueryKey(options),
  } as const satisfies QueryOptions<
    GetEnsPriceQueryFnData,
    GetEnsPriceErrorType,
    GetEnsPriceData,
    GetEnsPriceQueryKey<config>
  >
}
