import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import {
  getDecodedName,
  type GetDecodedNameReturnType,
} from '@ensdomains/ensjs/subgraph'
import type { ParamWithClients } from '../client.js'
import { fallbackQueryClient } from '../query.js'

export type UseDecodedNameParams = ParamWithClients<{
  name: string
  allowIncomplete?: boolean
}>

/**
 * Decode names returned using the subgraph
 *
 * Performs network request only if the name needs to be decoded, otherwise transparent
 *
 * @param data - {@link UseDecodedNameParams}
 * @returns - {@link GetDecodedNameReturnType}
 */
export const useDecodedName = (
  data: UseDecodedNameParams,
): UseQueryResult<GetDecodedNameReturnType> => {
  const {
    name,
    allowIncomplete,
    client,
    queryClient = fallbackQueryClient,
  } = data

  return useQuery(
    {
      queryKey: ['ensjs', 'decoded-subgraph-name', name],
      queryFn: async () => {
        const result = await getDecodedName(client, {
          name,
          allowIncomplete,
        })

        return result
      },
    },
    queryClient,
  )
}
