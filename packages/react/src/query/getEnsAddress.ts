import {
  getAddressRecord,
  type GetAddressRecordErrorType as ensjs_GetEnsAddressErrorType,
  type GetAddressRecordParameters as ensjs_GetEnsAddressParameters,
  type GetAddressRecordReturnType as ensjs_GetEnsAddressReturnType,
} from '@ensdomains/ensjs/public'
import type { QueryOptions } from '@tanstack/react-query'
import type { ConfigWithEns } from '../types/config.js'
import type {
  ChainIdParameter,
  ScopeKeyParameter,
} from '../types/properties.js'
import type { Compute, ExactPartial } from '../types/utils.js'
import { filterQueryOptions, getClientAndParameters } from './utils.js'

export type GetEnsAddressParameters<
  config extends ConfigWithEns = ConfigWithEns,
> = Compute<ensjs_GetEnsAddressParameters & ChainIdParameter<config>>

export type GetEnsAddressReturnType = ensjs_GetEnsAddressReturnType

export type GetEnsAddressErrorType = ensjs_GetEnsAddressErrorType

export type GetEnsAddressOptions<config extends ConfigWithEns = ConfigWithEns> =
  Compute<ExactPartial<GetEnsAddressParameters<config>> & ScopeKeyParameter>

export type GetEnsAddressQueryFnData = GetEnsAddressReturnType

export type GetEnsAddressData = GetEnsAddressReturnType

export const getEnsAddressQueryKey = <config extends ConfigWithEns>(
  options: GetEnsAddressOptions<config>,
) => {
  return ['getEnsAddress', filterQueryOptions(options)] as const
}

export type GetEnsAddressQueryKey<config extends ConfigWithEns> = ReturnType<
  typeof getEnsAddressQueryKey<config>
>

export const getEnsAddressQueryOptions = <config extends ConfigWithEns>(
  config: config,
  options: GetEnsAddressOptions<config> = {},
) => {
  return {
    async queryFn({ queryKey }) {
      const { name, ...rest } = queryKey[1]
      if (!name) throw new Error('name is required')

      const { client, parameters } = getClientAndParameters(config, {
        ...rest,
        name,
      })
      return getAddressRecord(client, parameters)
    },
    queryKey: getEnsAddressQueryKey(options),
  } as const satisfies QueryOptions<
    GetEnsAddressQueryFnData,
    GetEnsAddressErrorType,
    GetEnsAddressData,
    GetEnsAddressQueryKey<config>
  >
}
