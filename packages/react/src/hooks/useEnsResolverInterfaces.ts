import type { Hex } from 'viem'
import { useChainId, useConfig } from 'wagmi'
import { useQuery, type UseQueryReturnType } from 'wagmi/query'
import {
  getEnsResolverInterfacesQueryOptions,
  type GetEnsResolverInterfacesData,
  type GetEnsResolverInterfacesErrorType,
  type GetEnsResolverInterfacesOptions,
  type GetEnsResolverInterfacesQueryFnData,
  type GetEnsResolverInterfacesQueryKey,
} from '../query/getEnsResolverInterfaces.js'
import type { ConfigWithEns } from '../types/config.js'
import type { ConfigParameter, QueryParameter } from '../types/properties.js'
import type { ResolvedRegister } from '../types/register.js'
import type { Compute } from '../types/utils.js'

export type UseEnsResolverInterfacesParameters<
  config extends ConfigWithEns = ConfigWithEns,
  interfaces extends readonly Hex[] = readonly Hex[],
  selectData = GetEnsResolverInterfacesData<interfaces>,
> = Compute<
  GetEnsResolverInterfacesOptions<config, interfaces> &
    ConfigParameter<config> &
    QueryParameter<
      GetEnsResolverInterfacesQueryFnData<interfaces>,
      GetEnsResolverInterfacesErrorType,
      selectData,
      GetEnsResolverInterfacesQueryKey<config, interfaces>
    >
>

export type UseEnsResolverInterfacesReturnType<
  interfaces extends readonly Hex[],
  selectData = GetEnsResolverInterfacesData<interfaces>,
> = UseQueryReturnType<selectData, GetEnsResolverInterfacesErrorType>

/**
 * Returns whether or not the interfaces are supported by the resolver
 * You can find a list of interfaces at https://docs.ens.domains/resolvers/interfaces
 *
 * You can use the {@link resolverInterfaces} shorthand, or manually specify a Hex value
 *
 * @param parameters - {@link UseEnsResolverInterfacesParameters}
 * @returns - {@link UseEnsResolverInterfacesReturnType}
 */
export const useEnsResolverInterfaces = <
  config extends ConfigWithEns = ResolvedRegister['config'],
  const interfaces extends readonly Hex[] = readonly Hex[],
  selectData = GetEnsResolverInterfacesData<interfaces>,
>(
  parameters: UseEnsResolverInterfacesParameters<
    config,
    interfaces,
    selectData
  > = {},
): UseEnsResolverInterfacesReturnType<interfaces, selectData> => {
  const { address, interfaces, query = {} } = parameters

  const config = useConfig<ConfigWithEns>()
  const chainId = useChainId({ config })

  const options = getEnsResolverInterfacesQueryOptions(config, {
    ...parameters,
    chainId: parameters.chainId ?? chainId,
  })
  const enabled = Boolean(address && interfaces && (query.enabled ?? true))

  return useQuery({ ...query, ...options, enabled })
}
