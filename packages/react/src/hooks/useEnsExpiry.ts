import {
  getExpiry,
  type GetExpiryParameters,
  type GetExpiryReturnType,
} from '@ensdomains/ensjs/public'
import type { ParamWithClients } from '../client.js'
import { useQuery, type UseQueryReturnType } from './useQuery.js'

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
): UseQueryReturnType<UseEnsExpiryReturnType> => {
  const { client, queryClient } = params

  return useQuery(
    ['ensjs', 'ens-expiry', params.name],
    {
      queryFn: async () => {
        const result = await getExpiry(client, params)

        return result
      },
    },
    queryClient,
  )
}
