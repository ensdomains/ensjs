import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { Hex } from 'viem'
import {
  getSupportedInterfaces,
  type GetSupportedInterfacesParameters,
  type GetSupportedInterfacesReturnType,
} from '@ensdomains/ensjs/public'
import type { ParamWithClients } from '../client.js'
import { fallbackQueryClient } from '../query.js'

export type UseEnsResolverInterfacesParams<
  Interfaces extends readonly Hex[] = [Hex, Hex],
> = ParamWithClients<GetSupportedInterfacesParameters<Interfaces>>

export type UseEnsResolverInterfacesReturnType<
  Interfaces extends readonly Hex[],
> = GetSupportedInterfacesReturnType<Interfaces>

/**
 * Returns a wether or not the interfaces are supported by the resolver
 * You can find a list of interfaces at https://docs.ens.domains/resolvers/interfaces
 *
 * You can use the {@link resolverInterfaces} shorthand, or manually specify a Hex value
 *
 * @param params - {@link UseEnsResolverInterfacesParams}
 * @returns - {@link boolean[]}
 */
export const useEnsResolverInterfaces = <Interfaces extends readonly Hex[]>(
  params: UseEnsResolverInterfacesParams<Interfaces>,
): UseQueryResult<UseEnsResolverInterfacesReturnType<Interfaces>> => {
  const { client, queryClient = fallbackQueryClient } = params

  return useQuery(
    {
      queryKey: ['ensjs', 'resolver-interfaces', params.address],
      queryFn: async () => {
        const result = await getSupportedInterfaces(client, params)

        return result
      },
    },
    queryClient,
  )
}
