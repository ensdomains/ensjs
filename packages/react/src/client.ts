import type { ClientWithEns } from '@ensdomains/ensjs/contracts'
import type { QueryClient } from '@tanstack/react-query'
import type { UseQueryParameters } from './hooks/useQuery.js'

export type ParamWithClients<T> = T & {
  client: ClientWithEns
}

export type QueryConfig = {
  queryClient?: QueryClient
} & UseQueryParameters
