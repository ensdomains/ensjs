import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import {
  getAvailable,
  type GetAvailableParameters,
  type GetAvailableReturnType,
} from '@ensdomains/ensjs/public'
import type { ParamWithClients } from '../client.js'
import { fallbackQueryClient } from '../query.js'

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
): UseQueryResult<UseEnsAvailableReturnType> => {
  const { client, queryClient = fallbackQueryClient } = params

  return useQuery(
    {
      queryKey: ['ensjs', 'eth-name-available', params.name],
      queryFn: async () => {
        const result = await getAvailable(client, params)

        return result
      },
    },
    queryClient,
  )
}
