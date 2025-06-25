import {
  type GetAbiRecordErrorType as ensjs_GetEnsAbiErrorType,
  type GetAbiRecordParameters as ensjs_GetEnsAbiParameters,
  type GetAbiRecordReturnType as ensjs_GetEnsAbiReturnType,
  getAbiRecord,
} from '@ensdomains/ensjs/public'
import type { QueryOptions } from '@tanstack/react-query'
import type { ConfigWithEns } from '../types/config.js'
import type {
  ChainIdParameter,
  ScopeKeyParameter,
} from '../types/properties.js'
import type { Compute, ExactPartial } from '../types/utils.js'
import { filterQueryOptions, getClientAndParameters } from './utils.js'

export type GetEnsAbiParameters<config extends ConfigWithEns = ConfigWithEns> =
  Compute<ensjs_GetEnsAbiParameters & ChainIdParameter<config>>

export type GetEnsAbiReturnType = ensjs_GetEnsAbiReturnType

export type GetEnsAbiErrorType = ensjs_GetEnsAbiErrorType

export type GetEnsAbiOptions<config extends ConfigWithEns = ConfigWithEns> =
  Compute<ExactPartial<GetEnsAbiParameters<config>> & ScopeKeyParameter>

export type GetEnsAbiQueryFnData = GetEnsAbiReturnType

export type GetEnsAbiData = GetEnsAbiReturnType

export const getEnsAbiQueryKey = <config extends ConfigWithEns>(
  options: GetEnsAbiOptions<config>,
) => {
  return ['getEnsAbi', filterQueryOptions(options)] as const
}

export type GetEnsAbiQueryKey<config extends ConfigWithEns> = ReturnType<
  typeof getEnsAbiQueryKey<config>
>

export const getEnsAbiQueryOptions = <config extends ConfigWithEns>(
  config: config,
  options: GetEnsAbiOptions<config> = {},
) => {
  return {
    async queryFn({ queryKey }) {
      const { name, ...rest } = queryKey[1]
      if (!name) throw new Error('name is required')

      const { client, parameters } = getClientAndParameters(config, {
        ...rest,
        name,
      })
      return getAbiRecord(client, parameters)
    },
    queryKey: getEnsAbiQueryKey(options),
  } as const satisfies QueryOptions<
    GetEnsAbiQueryFnData,
    GetEnsAbiErrorType,
    GetEnsAbiData,
    GetEnsAbiQueryKey<config>
  >
}
