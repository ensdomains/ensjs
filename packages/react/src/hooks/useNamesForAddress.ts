import {
  type GetNamesForAddressReturnType,
  getNamesForAddress,
} from '@ensdomains/ensjs/subgraph'
import type { Address } from 'viem'
import type { ParamWithClients, QueryConfig } from '../client.js'
import { type UseQueryReturnType, useQuery } from './useQuery.js'

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
  queryConfig?: QueryConfig,
): UseQueryReturnType<UseNamesForAddressReturnType> => {
  const { address, client } = params

  return useQuery(
    ['ensjs', 'names-for-address', address],
    {
      queryFn: async () => {
        const result = await getNamesForAddress(client, {
          address,
        })

        return result
      },
      enabled: !!params.address,
      initialData: [],
    },
    queryConfig,
  )
}
