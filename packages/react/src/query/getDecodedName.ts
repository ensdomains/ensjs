import {
  getDecodedName,
  type GetDecodedNameErrorType as ensjs_GetDecodedNameErrorType,
  type GetDecodedNameParameters as ensjs_GetDecodedNameParameters,
  type GetDecodedNameReturnType as ensjs_GetDecodedNameReturnType,
} from '@ensdomains/ensjs/subgraph'
import type { QueryOptions } from '@tanstack/react-query'
import type { ConfigWithEns } from '../types/config.js'
import type {
  ChainIdParameter,
  ScopeKeyParameter,
} from '../types/properties.js'
import type { Compute, ExactPartial } from '../types/utils.js'
import { filterQueryOptions, getClientAndParameters } from './utils.js'

export type GetDecodedNameParameters<
  config extends ConfigWithEns = ConfigWithEns,
> = Compute<ensjs_GetDecodedNameParameters & ChainIdParameter<config>>

export type GetDecodedNameReturnType = ensjs_GetDecodedNameReturnType

export type GetDecodedNameErrorType = ensjs_GetDecodedNameErrorType

export type GetDecodedNameOptions<
  config extends ConfigWithEns = ConfigWithEns,
> = Compute<ExactPartial<GetDecodedNameParameters<config>> & ScopeKeyParameter>

export type GetDecodedNameQueryFnData = GetDecodedNameReturnType

export type GetDecodedNameData = GetDecodedNameReturnType

export const getDecodedNameQueryKey = <config extends ConfigWithEns>(
  options: GetDecodedNameOptions<config>,
) => {
  return ['getDecodedName', filterQueryOptions(options)] as const
}

export type GetDecodedNameQueryKey<config extends ConfigWithEns> = ReturnType<
  typeof getDecodedNameQueryKey<config>
>

export const getDecodedNameQueryOptions = <config extends ConfigWithEns>(
  config: config,
  options: GetDecodedNameOptions<config> = {},
) => {
  return {
    async queryFn({ queryKey }) {
      const { name, ...rest } = queryKey[1]
      if (!name) throw new Error('name is required')

      const { client, parameters } = getClientAndParameters(config, {
        ...rest,
        name,
      })
      return getDecodedName(client, parameters)
    },
    queryKey: getDecodedNameQueryKey(options),
  } as const satisfies QueryOptions<
    GetDecodedNameQueryFnData,
    GetDecodedNameErrorType,
    GetDecodedNameData,
    GetDecodedNameQueryKey<config>
  >
}
