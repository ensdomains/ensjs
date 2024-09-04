import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { Address, Hex } from 'viem'
import { getSupportedInterfaces } from '@ensdomains/ensjs/public'
import type { ParamWithClients } from '../client.js'
import { fallbackQueryClient } from '../query.js'
import { resolverInterfaces } from '../interfaces.js'

export type UseEnsResolverInterfacesParams<
  Interfaces extends readonly Hex[] = [Hex, Hex],
> = ParamWithClients<{
  resolver: Address
  interfaces?: Interfaces
}>

export type UseEnsResolverInterfacesReturnType<
  Interfaces extends readonly Hex[],
> = {
  [K in keyof Interfaces]: boolean
}

/**
 * Returns a wether or not the interfaces are supported by the resolver
 * You can find a list of interfaces at https://docs.ens.domains/resolvers/interfaces
 *
 * You can use the {@link resolverInterfaces} shorthand, or manually specify a Hex value
 *
 * @param data - {@link UseEnsResolverInterfacesParams}
 * @returns - {@link boolean[]}
 */
export const useEnsResolverInterfaces = <Interfaces extends readonly Hex[]>(
  data: UseEnsResolverInterfacesParams<Interfaces>,
): UseQueryResult<UseEnsResolverInterfacesReturnType<Interfaces>> => {
  const {
    resolver,
    interfaces = [
      resolverInterfaces.addrMulticoin,
      resolverInterfaces.wildcard,
    ],
    client,
    queryClient = fallbackQueryClient,
  } = data

  return useQuery(
    {
      queryKey: ['ensjs', 'resolver-interfaces', resolver],
      queryFn: async () => {
        const result = await getSupportedInterfaces(client, {
          address: resolver,
          interfaces,
        })

        return result
      },
    },
    queryClient,
  )
}
