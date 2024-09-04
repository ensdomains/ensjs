import type { ClientWithEns } from '@ensdomains/ensjs/contracts'
import type { QueryClient } from '@tanstack/react-query'

export type ParamWithClients<T> = T & {
  client: ClientWithEns
  queryClient?: QueryClient
}
