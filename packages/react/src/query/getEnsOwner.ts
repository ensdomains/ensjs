import {
  getOwner,
  type GetOwnerErrorType as ensjs_GetEnsOwnerErrorType,
  type GetOwnerParameters as ensjs_GetEnsOwnerParameters,
  type GetOwnerReturnType as ensjs_GetEnsOwnerReturnType,
} from '@ensdomains/ensjs/public'
import type { QueryOptions } from '@tanstack/react-query'
import type { ConfigWithEns } from '../types/config.js'
import type {
  ChainIdParameter,
  ScopeKeyParameter,
} from '../types/properties.js'
import type { Compute, ExactPartial } from '../types/utils.js'
import { filterQueryOptions, getClientAndParameters } from './utils.js'

export type GetEnsOwnerParameters<
  config extends ConfigWithEns = ConfigWithEns,
> = Compute<ensjs_GetEnsOwnerParameters & ChainIdParameter<config>>

export type GetEnsOwnerReturnType = ensjs_GetEnsOwnerReturnType

export type GetEnsOwnerErrorType = ensjs_GetEnsOwnerErrorType

export type GetEnsOwnerOptions<config extends ConfigWithEns = ConfigWithEns> =
  Compute<ExactPartial<GetEnsOwnerParameters<config>> & ScopeKeyParameter>

export type GetEnsOwnerQueryFnData = GetEnsOwnerReturnType

export type GetEnsOwnerData = GetEnsOwnerReturnType

export const getEnsOwnerQueryKey = <config extends ConfigWithEns>(
  options: GetEnsOwnerOptions<config>,
) => {
  return ['getEnsOwner', filterQueryOptions(options)] as const
}

export type GetEnsOwnerQueryKey<config extends ConfigWithEns> = ReturnType<
  typeof getEnsOwnerQueryKey<config>
>

export const getEnsOwnerQueryOptions = <config extends ConfigWithEns>(
  config: config,
  options: GetEnsOwnerOptions<config> = {},
) => {
  return {
    async queryFn({ queryKey }) {
      const { name, ...rest } = queryKey[1]
      if (!name) throw new Error('name is required')

      const { client, parameters } = getClientAndParameters(config, {
        ...rest,
        name,
      })
      return getOwner(client, parameters)
    },
    queryKey: getEnsOwnerQueryKey(options),
  } as const satisfies QueryOptions<
    GetEnsOwnerQueryFnData,
    GetEnsOwnerErrorType,
    GetEnsOwnerData,
    GetEnsOwnerQueryKey<config>
  >
}
