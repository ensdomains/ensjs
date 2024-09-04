import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import {
  getDecodedName,
  type GetDecodedNameParameters,
  type GetDecodedNameReturnType,
} from '@ensdomains/ensjs/subgraph'
import type { ParamWithClients } from '../client.js'
import { fallbackQueryClient } from '../query.js'

export type UseDecodedNameParams = ParamWithClients<GetDecodedNameParameters>

export type UseDecodedNameReturnType = GetDecodedNameReturnType

/**
 * Decode names returned using the subgraph
 *
 * Performs network request only if the name needs to be decoded, otherwise transparent
 *
 * @param params - {@link UseDecodedNameParams}
 * @returns - {@link GetDecodedNameReturnType}
 */
export const useDecodedName = (
  params: UseDecodedNameParams,
): UseQueryResult<UseDecodedNameReturnType> => {
  const { client, queryClient = fallbackQueryClient } = params

  return useQuery(
    {
      queryKey: ['ensjs', 'decoded-subgraph-name', params.name],
      queryFn: async () => {
        const result = await getDecodedName(client, params)

        return result
      },
    },
    queryClient,
  )
}
