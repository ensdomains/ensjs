import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { Address } from 'viem'
import {
  getNamesForAddress,
  type GetNamesForAddressReturnType,
} from '@ensdomains/ensjs/subgraph'
import { fallbackQueryClient } from '../query.js'
import type { ParamWithClients } from '../client.js'

export type UseNamesForAddressParams = ParamWithClients<{
  address: Address
}>

export type UseNamesForAddressReturnType = GetNamesForAddressReturnType

/**
 * Returns a list of names for an address
 *
 * Keep in mind that this list will be loaded from the subgraph, and only include watchable names.
 * Read more about enumeration and watchability here: https://docs.ens.domains/web/enumerate
 *
 * @param params - {@link UseNamesForAddressParams}
 * @returns - {@link UseNamesForAddressReturnType}
 */
export const useNamesForAddress = (
  params: UseNamesForAddressParams,
): UseQueryResult<UseNamesForAddressReturnType> => {
  const { address, client, queryClient = fallbackQueryClient } = params

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
