import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import {
  getExpiry,
  type GetExpiryParameters,
  type GetExpiryReturnType,
} from '@ensdomains/ensjs/public'
import type { ParamWithClients } from '../client.js'
import { fallbackQueryClient } from '../query.js'

export type UseEnsExpiryParams = ParamWithClients<GetExpiryParameters>

export type UseEnsExpiryReturnType = GetExpiryReturnType

/**
 * Returns expiry of a name
 *
 * Keep in mind that this function is limited to second-level .eth names (luc.eth, nick.eth, etc)
 *
 * @param params - {@link UseEnsExpiryParams}
 * @returns - {@link UseEnsExpiryReturnType}
 */
export const useEnsExpiry = (
  params: UseEnsExpiryParams,
): UseQueryResult<UseEnsExpiryReturnType> => {
  const { client, queryClient = fallbackQueryClient } = params

  return useQuery(
    {
      queryKey: ['ensjs', 'ens-expiry', params.name],
      queryFn: async () => {
        const result = await getExpiry(client, params)

        return result
      },
    },
    queryClient,
  )
}
