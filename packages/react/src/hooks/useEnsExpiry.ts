import {
  type GetExpiryParameters,
  type GetExpiryReturnType,
  getExpiry,
} from '@ensdomains/ensjs/public'
import type { ParamWithClients, QueryConfig } from '../client.js'
import { type UseQueryReturnType, useQuery } from './useQuery.js'

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
  query?: QueryConfig,
): UseQueryReturnType<UseEnsExpiryReturnType> => {
  const { client } = params

  return useQuery(
    ['ensjs', 'ens-expiry', params.name],
    {
      queryFn: async () => getExpiry(client, params),
    },
    query,
  )
}
