import {
  type GetAvailableParameters,
  type GetAvailableReturnType,
  getAvailable,
} from '@ensdomains/ensjs/public'
import type { ParamWithClients, QueryConfig } from '../client.js'
import { type UseQueryReturnType, useQuery } from './useQuery.js'

export type UseEnsAvailableParams = ParamWithClients<GetAvailableParameters>

export type UseEnsAvailableReturnType = GetAvailableReturnType

/**
 * Returns a list of names for an address
 *
 * Keep in mind that this function is limited to .eth names
 *
 * @param params - {@link UseEnsAvailableParams}
 * @returns - {@link UseEnsAvailableReturnType}
 */
export const useEnsAvailable = (
  params: UseEnsAvailableParams,
  query?: QueryConfig,
): UseQueryReturnType<UseEnsAvailableReturnType> => {
  const { client } = params

  return useQuery(
    ['ensjs', 'eth-name-available', params.name],
    {
      queryKey: [],
      queryFn: async () => {
        const result = await getAvailable(client, params)

        return result
      },
    },
    query,
  )
}
