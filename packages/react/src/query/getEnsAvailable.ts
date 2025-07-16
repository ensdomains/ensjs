import {
  type GetAvailableErrorType,
  type GetAvailableParameters,
  type GetAvailableReturnType,
  getAvailable,
} from '@ensdomains/ensjs/public'
import type { QueryOptions } from '@tanstack/react-query'
import type { ConfigWithEns } from '../types/config.js'
import type {
  ChainIdParameter,
  ScopeKeyParameter,
} from '../types/properties.js'
import type { Compute, ExactPartial } from '../types/utils.js'
import { filterQueryOptions, getClientAndParameters } from './utils.js'

export type GetEnsAvailableParameters<
  config extends ConfigWithEns = ConfigWithEns,
> = Compute<GetAvailableParameters & ChainIdParameter<config>>

export type GetEnsAvailableReturnType = GetAvailableReturnType

export type GetEnsAvailableErrorType = GetAvailableErrorType

export type GetEnsAvailableOptions<
  config extends ConfigWithEns = ConfigWithEns,
> = Compute<ExactPartial<GetEnsAvailableParameters<config>> & ScopeKeyParameter>

export type GetEnsAvailableQueryFnData = GetAvailableReturnType

export type GetEnsAvailableData = GetAvailableReturnType

export const getEnsAvailableQueryKey = <config extends ConfigWithEns>(
  options: GetEnsAvailableOptions<config>,
) => {
  return ['getEnsAvailable', filterQueryOptions(options)] as const
}

export type GetEnsAvailableQueryKey<config extends ConfigWithEns> = ReturnType<
  typeof getEnsAvailableQueryKey<config>
>

export const getEnsAvailableQueryOptions = <config extends ConfigWithEns>(
  config: config,
  options: GetEnsAvailableOptions<config> = {},
) => {
  return {
    async queryFn({ queryKey }) {
      const { name, ...rest } = queryKey[1]
      if (!name) throw new Error('name is required')

      const { client, parameters } = getClientAndParameters(config, {
        ...rest,
        name,
      })
      return getAvailable(client, parameters)
    },
    queryKey: getEnsAvailableQueryKey(options),
  } as const satisfies QueryOptions<
    GetEnsAvailableQueryFnData,
    GetEnsAvailableErrorType,
    GetEnsAvailableData,
    GetEnsAvailableQueryKey<config>
  >
}
