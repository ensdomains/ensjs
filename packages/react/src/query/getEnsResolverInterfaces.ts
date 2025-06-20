import {
  getSupportedInterfaces,
  type GetSupportedInterfacesErrorType as ensjs_GetSupportedInterfacesErrorType,
  type GetSupportedInterfacesParameters as ensjs_GetSupportedInterfacesParameters,
  type GetSupportedInterfacesReturnType as ensjs_GetSupportedInterfacesReturnType,
} from '@ensdomains/ensjs/public'
import type { QueryOptions } from '@tanstack/react-query'
import type { Hex } from 'viem'
import type { ConfigWithEns } from '../types/config.js'
import type {
  ChainIdParameter,
  ScopeKeyParameter,
} from '../types/properties.js'
import type { Compute, ExactPartial } from '../types/utils.js'
import { filterQueryOptions, getClientAndParameters } from './utils.js'

export type GetEnsResolverInterfacesParameters<
  config extends ConfigWithEns = ConfigWithEns,
  interfaces extends readonly Hex[] = readonly Hex[],
> = Compute<
  ensjs_GetSupportedInterfacesParameters<interfaces> & ChainIdParameter<config>
>

export type GetEnsResolverInterfacesReturnType<
  interfaces extends readonly Hex[],
> = ensjs_GetSupportedInterfacesReturnType<interfaces>

export type GetEnsResolverInterfacesErrorType =
  ensjs_GetSupportedInterfacesErrorType

export type GetEnsResolverInterfacesOptions<
  config extends ConfigWithEns = ConfigWithEns,
  interfaces extends readonly Hex[] = readonly Hex[],
> = Compute<
  ExactPartial<GetEnsResolverInterfacesParameters<config, interfaces>> &
    ScopeKeyParameter
>

export type GetEnsResolverInterfacesQueryFnData<
  interfaces extends readonly Hex[],
> = GetEnsResolverInterfacesReturnType<interfaces>

export type GetEnsResolverInterfacesData<interfaces extends readonly Hex[]> =
  GetEnsResolverInterfacesReturnType<interfaces>

export const getEnsResolverInterfacesQueryKey = <
  config extends ConfigWithEns,
  const interfaces extends readonly Hex[],
>(
  options: GetEnsResolverInterfacesOptions<config, interfaces>,
) => {
  return ['getEnsResolverInterfaces', filterQueryOptions(options)] as const
}

export type GetEnsResolverInterfacesQueryKey<
  config extends ConfigWithEns,
  interfaces extends readonly Hex[],
> = ReturnType<typeof getEnsResolverInterfacesQueryKey<config, interfaces>>

export const getEnsResolverInterfacesQueryOptions = <
  config extends ConfigWithEns,
  const interfaces extends readonly Hex[],
>(
  config: config,
  options: GetEnsResolverInterfacesOptions<config, interfaces> = {},
) => {
  return {
    async queryFn({ queryKey }) {
      const { address, interfaces, ...rest } = queryKey[1]
      if (!address) throw new Error('address is required')
      if (!interfaces) throw new Error('interfaces are required')

      const { client, parameters } = getClientAndParameters(config, {
        ...rest,
        address,
        interfaces,
      })

      return getSupportedInterfaces(client, parameters)
    },
    queryKey: getEnsResolverInterfacesQueryKey(options),
  } as const satisfies QueryOptions<
    GetEnsResolverInterfacesQueryFnData<interfaces>,
    GetEnsResolverInterfacesErrorType,
    GetEnsResolverInterfacesData<interfaces>,
    GetEnsResolverInterfacesQueryKey<config, interfaces>
  >
}
