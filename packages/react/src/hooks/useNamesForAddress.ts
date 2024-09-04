import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { Address } from 'viem'
import {
  getNamesForAddress,
  type GetNamesForAddressReturnType,
} from '@ensdomains/ensjs/subgraph'
import { fallbackQueryClient } from '../query.js'
import type { ParamWithClients } from '../client.js'

export type UseNamesParams = ParamWithClients<{
  address: Address
}>

/**
 * Returns a list of names for an address
 *
 * Keep in mind that this list will be loaded from the subgraph, and only include watchable names.
 * Read more about enumeration and watchability here: https://docs.ens.domains/web/enumerate
 *
 * @param data - {@link UseNamesParams}
 * @returns - {@link GetNamesForAddressReturnType}
 */
export const useNamesForAddress = (
  data: UseNamesParams,
): UseQueryResult<GetNamesForAddressReturnType> => {
  const { address, client, queryClient = fallbackQueryClient } = data

  return useQuery(
    {
      queryKey: ['ensjs', 'names-for-address', address],
      queryFn: async () => {
        const result = await getNamesForAddress(client, {
          address,
        })

        return result
      },
    },
    queryClient,
  )
}
