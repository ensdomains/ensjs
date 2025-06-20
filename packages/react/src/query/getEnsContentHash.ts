import {
  getContentHashRecord,
  type GetContentHashRecordErrorType as ensjs_GetEnsContentHashErrorType,
  type GetContentHashRecordParameters as ensjs_GetEnsContentHashParameters,
  type GetContentHashRecordReturnType as ensjs_GetEnsContentHashReturnType,
} from '@ensdomains/ensjs/public'
import type { QueryOptions } from '@tanstack/react-query'
import type { ConfigWithEns } from '../types/config.js'
import type {
  ChainIdParameter,
  ScopeKeyParameter,
} from '../types/properties.js'
import type { Compute, ExactPartial } from '../types/utils.js'
import { filterQueryOptions, getClientAndParameters } from './utils.js'

export type GetEnsContentHashParameters<
  config extends ConfigWithEns = ConfigWithEns,
> = Compute<ensjs_GetEnsContentHashParameters & ChainIdParameter<config>>

export type GetEnsContentHashReturnType = ensjs_GetEnsContentHashReturnType

export type GetEnsContentHashErrorType = ensjs_GetEnsContentHashErrorType

export type GetEnsContentHashOptions<
  config extends ConfigWithEns = ConfigWithEns,
> = Compute<
  ExactPartial<GetEnsContentHashParameters<config>> & ScopeKeyParameter
>

export type GetEnsContentHashQueryFnData = GetEnsContentHashReturnType

export type GetEnsContentHashData = GetEnsContentHashReturnType

export const getEnsContentHashQueryKey = <config extends ConfigWithEns>(
  options: GetEnsContentHashOptions<config>,
) => {
  return ['getEnsContentHash', filterQueryOptions(options)] as const
}

export type GetEnsContentHashQueryKey<config extends ConfigWithEns> =
  ReturnType<typeof getEnsContentHashQueryKey<config>>

export const getEnsContentHashQueryOptions = <config extends ConfigWithEns>(
  config: config,
  options: GetEnsContentHashOptions<config> = {},
) => {
  return {
    async queryFn({ queryKey }) {
      const { name, ...rest } = queryKey[1]
      if (!name) throw new Error('name is required')

      const { client, parameters } = getClientAndParameters(config, {
        ...rest,
        name,
      })
      return getContentHashRecord(client, parameters)
    },
    queryKey: getEnsContentHashQueryKey(options),
  } as const satisfies QueryOptions<
    GetEnsContentHashQueryFnData,
    GetEnsContentHashErrorType,
    GetEnsContentHashData,
    GetEnsContentHashQueryKey<config>
  >
}
