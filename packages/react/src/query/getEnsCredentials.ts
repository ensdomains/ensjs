import {
  type GetCredentialsErrorType as ensjs_GetCredentialsErrorType,
  type GetCredentialsParameters as ensjs_GetCredentialsParameters,
  type GetCredentialsReturnType as ensjs_GetCredentialsReturnType,
  getCredentials,
} from '@ensdomains/ensjs/public'
import type { QueryOptions } from '@tanstack/react-query'
import type { ConfigWithEns } from '../types/config.js'
import type {
  ChainIdParameter,
  ScopeKeyParameter,
} from '../types/properties.js'
import type { Compute, ExactPartial } from '../types/utils.js'
import { filterQueryOptions, getClientAndParameters } from './utils.js'

export type GetEnsCredentialsParameters<
  config extends ConfigWithEns = ConfigWithEns,
> = Compute<ensjs_GetCredentialsParameters & ChainIdParameter<config>>

export type GetEnsCredentialsReturnType = ensjs_GetCredentialsReturnType

export type GetEnsCredentialsErrorType = ensjs_GetCredentialsErrorType

export type GetEnsCredentialsOptions<
  config extends ConfigWithEns = ConfigWithEns,
> = Compute<
  ExactPartial<GetEnsCredentialsParameters<config>> & ScopeKeyParameter
>

export type GetEnsCredentialsQueryFnData = GetEnsCredentialsReturnType

export type GetEnsCredentialsData = GetEnsCredentialsReturnType

export const getEnsCredentialsQueryKey = <config extends ConfigWithEns>(
  options: GetEnsCredentialsOptions<config>,
) => {
  return ['getEnsCredentials', filterQueryOptions(options)] as const
}

export type GetEnsCredentialsQueryKey<config extends ConfigWithEns> =
  ReturnType<typeof getEnsCredentialsQueryKey<config>>

export const getEnsCredentialsQueryOptions = <config extends ConfigWithEns>(
  config: config,
  options: GetEnsCredentialsOptions<config> = {},
) => {
  return {
    async queryFn({ queryKey }) {
      const { name, ...rest } = queryKey[1]
      if (!name) throw new Error('name is required')

      const { client, parameters } = getClientAndParameters(config, {
        ...rest,
        name,
      })

      return getCredentials(client, parameters)
    },
    queryKey: getEnsCredentialsQueryKey(options),
  } as const satisfies QueryOptions<
    GetEnsCredentialsQueryFnData,
    GetEnsCredentialsErrorType,
    GetEnsCredentialsData,
    GetEnsCredentialsQueryKey<config>
  >
}
