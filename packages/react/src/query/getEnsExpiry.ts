import {
  getExpiry,
  type GetExpiryErrorType as ensjs_GetExpiryErrorType,
  type GetExpiryParameters as ensjs_GetExpiryParameters,
  type GetExpiryReturnType as ensjs_GetExpiryReturnType,
} from '@ensdomains/ensjs/public'
import type { QueryOptions } from '@tanstack/react-query'
import type { ConfigWithEns } from '../types/config.js'
import type {
  ChainIdParameter,
  ScopeKeyParameter,
} from '../types/properties.js'
import type { Compute, ExactPartial } from '../types/utils.js'
import { filterQueryOptions, getClientAndParameters } from './utils.js'

export type GetEnsExpiryParameters<
  config extends ConfigWithEns = ConfigWithEns,
> = Compute<ensjs_GetExpiryParameters & ChainIdParameter<config>>

export type GetEnsExpiryReturnType = ensjs_GetExpiryReturnType

export type GetEnsExpiryErrorType = ensjs_GetExpiryErrorType

export type GetEnsExpiryOptions<config extends ConfigWithEns = ConfigWithEns> =
  Compute<ExactPartial<GetEnsExpiryParameters<config>> & ScopeKeyParameter>

export type GetEnsExpiryQueryFnData = GetEnsExpiryReturnType

export type GetEnsExpiryData = GetEnsExpiryReturnType

export const getEnsExpiryQueryKey = <config extends ConfigWithEns>(
  options: GetEnsExpiryOptions<config>,
) => {
  return ['getEnsExpiry', filterQueryOptions(options)] as const
}

export type GetEnsExpiryQueryKey<config extends ConfigWithEns> = ReturnType<
  typeof getEnsExpiryQueryKey<config>
>

export const getEnsExpiryQueryOptions = <config extends ConfigWithEns>(
  config: config,
  options: GetEnsExpiryOptions<config> = {},
) => {
  return {
    async queryFn({ queryKey }) {
      const { name, ...rest } = queryKey[1]
      if (!name) throw new Error('name is required')

      const { client, parameters } = getClientAndParameters(config, {
        ...rest,
        name,
      })

      return getExpiry(client, parameters)
    },
    queryKey: getEnsExpiryQueryKey(options),
  } as const satisfies QueryOptions<
    GetEnsExpiryQueryFnData,
    GetEnsExpiryErrorType,
    GetEnsExpiryData,
    GetEnsExpiryQueryKey<config>
  >
}
