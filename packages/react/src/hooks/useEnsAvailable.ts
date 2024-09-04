import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { getAvailable } from '@ensdomains/ensjs/public'
import type { ParamWithClients } from '../client.js'
import { fallbackQueryClient } from '../query.js'

export type UseEnsAvailableParams = ParamWithClients<{
  name: string
}>

/**
 * Returns a list of names for an address
 *
 * Keep in mind that this function is limited to .eth names
 *
 * @param data - {@link UseEnsAvailableParams}
 * @returns - {@link boolean}
 */
export const useEnsAvailable = (
  data: UseEnsAvailableParams,
): UseQueryResult<boolean> => {
  const { name, client, queryClient = fallbackQueryClient } = data

  return useQuery(
    {
      queryKey: ['ensjs', 'eth-name-available', name],
      queryFn: async () => {
        const result = await getAvailable(client, {
          name,
        })

        return result
      },
    },
    queryClient,
  )
}
