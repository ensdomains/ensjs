import {
  QueryClient,
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query'
import type { ClientWithEns } from '../contracts/consts.js'
import { getAvailable } from '../public.js'

export type UseEnsAvailableParams = {
  name: string
  client: ClientWithEns
  queryClient?: QueryClient
}

// TODO: figure out why not taking from provider
const fallbackQueryClient = new QueryClient()

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
