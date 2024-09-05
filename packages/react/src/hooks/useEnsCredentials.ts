import { getTextRecord } from '@ensdomains/ensjs/public'
import type { ParamWithClients } from '../client.js'
import { useQuery, type UseQueryReturnType } from './useQuery.js'

export type UseEnsCredentialsParams = ParamWithClients<{ name: string }>

export type ExternalCredential = {
  url: string
}

export type UseEnsCredentialsReturnType = ExternalCredential[]

/**
 * Returns credentials from a name
 *
 * @param params - {@link UseEnsCredentialsParams}
 * @returns - {@link UseEnsCredentialsReturnType}
 */
export const useEnsCredentials = (
  params: UseEnsCredentialsParams,
): UseQueryReturnType<UseEnsCredentialsReturnType> => {
  const { name, client, queryClient } = params

  return useQuery(
    ['ensjs', 'credentials', params.name],
    {
      queryFn: async () => {
        const result = await getTextRecord(client, {
          name,
          key: 'verifications',
        })

        if (!result) return []

        const credentials = (JSON.parse(result) as string[])
          .filter((url) => new URL(url))
          .map((url) => ({
            url,
          }))

        return credentials
      },
    },
    queryClient,
  )
}
