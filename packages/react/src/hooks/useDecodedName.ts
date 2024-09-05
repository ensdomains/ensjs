import {
  getDecodedName,
  type GetDecodedNameParameters,
  type GetDecodedNameReturnType,
} from '@ensdomains/ensjs/subgraph'
import type { ParamWithClients, QueryConfig } from '../client.js'
import { useQuery, type UseQueryReturnType } from './useQuery.js'

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
  query?: QueryConfig,
): UseQueryReturnType<UseDecodedNameReturnType> => {
  const { client } = params

  return useQuery(
    ['ensjs', 'decoded-subgraph-name', params.name],
    {
      queryFn: async () => {
        const result = await getDecodedName(client, params)

        return result
      },
    },
    query,
  )
}
