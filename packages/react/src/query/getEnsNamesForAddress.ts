import {
  getNamesForAddress,
  type GetNamesForAddressErrorType as ensjs_GetNamesForAddressErrorType,
  type GetNamesForAddressParameters as ensjs_GetNamesForAddressParameters,
  type GetNamesForAddressReturnType as ensjs_GetNamesForAddressReturnType,
} from '@ensdomains/ensjs/subgraph'
import type { QueryOptions } from '@tanstack/react-query'
import type { ConfigWithEns } from '../types/config.js'
import type {
  ChainIdParameter,
  ScopeKeyParameter,
} from '../types/properties.js'
import type { Compute, ExactPartial } from '../types/utils.js'
import { filterQueryOptions, getClientAndParameters } from './utils.js'

export type GetEnsNamesForAddressParameters<
  config extends ConfigWithEns = ConfigWithEns,
> = Compute<ensjs_GetNamesForAddressParameters & ChainIdParameter<config>>

export type GetEnsNamesForAddressReturnType = ensjs_GetNamesForAddressReturnType

export type GetEnsNamesForAddressErrorType = ensjs_GetNamesForAddressErrorType

export type GetEnsNamesForAddressOptions<
  config extends ConfigWithEns = ConfigWithEns,
> = Compute<
  ExactPartial<GetEnsNamesForAddressParameters<config>> & ScopeKeyParameter
>

export type GetEnsNamesForAddressQueryFnData = GetEnsNamesForAddressReturnType

export type GetEnsNamesForAddressData = GetEnsNamesForAddressReturnType

export const getEnsNamesForAddressQueryKey = <config extends ConfigWithEns>(
  options: GetEnsNamesForAddressOptions<config>,
) => {
  return ['getEnsNamesForAddress', filterQueryOptions(options)] as const
}

export type GetEnsNamesForAddressQueryKey<config extends ConfigWithEns> =
  ReturnType<typeof getEnsNamesForAddressQueryKey<config>>

export const getEnsNamesForAddressQueryOptions = <config extends ConfigWithEns>(
  config: config,
  options: GetEnsNamesForAddressOptions<config> = {},
) => {
  return {
    async queryFn({ queryKey }) {
      const { address, ...rest } = queryKey[1]
      if (!address) throw new Error('address is required')

      const { client, parameters } = getClientAndParameters(config, {
        ...rest,
        address,
      })

      return getNamesForAddress(client, parameters)
    },
    queryKey: getEnsNamesForAddressQueryKey(options),
  } as const satisfies QueryOptions<
    GetEnsNamesForAddressQueryFnData,
    GetEnsNamesForAddressErrorType,
    GetEnsNamesForAddressData,
    GetEnsNamesForAddressQueryKey<config>
  >
}
