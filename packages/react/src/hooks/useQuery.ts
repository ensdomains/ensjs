import {
  type DefaultError,
  type DefinedUseQueryResult,
  type QueryKey,
  type UseQueryOptions,
  useQuery as useTanstackQuery,
} from '@tanstack/react-query'
import type { ExactPartial } from 'viem'
import type { QueryConfig } from '../client.js'
import { fallbackQueryClient } from '../query.js'
import type { Compute } from '../utils/types.js'

export type UseQueryParameters<
  QueryFnData = unknown,
  Error = DefaultError,
  Data = QueryFnData,
  TheQueryKey extends QueryKey = QueryKey,
> = Compute<
  ExactPartial<
    Omit<UseQueryOptions<QueryFnData, Error, Data, TheQueryKey>, 'initialData'>
  > & {
    // Fix `initialData` type
    initialData?:
      | UseQueryOptions<QueryFnData, Error, Data, TheQueryKey>['initialData']
      | undefined
  }
>

export type UseQueryReturnType<
  Data = unknown,
  Error = DefaultError,
> = DefinedUseQueryResult<Data, Error>

export const useQuery = <
  Parameters extends UseQueryParameters,
  Data = unknown,
  Error = unknown,
>(
  key: QueryKey,
  queryParameters: Exclude<Parameters, 'queryKey'>,
  queryConfig?: QueryConfig,
): UseQueryReturnType<Data, Error> => {
  const parameters = {
    ...queryParameters,
    ...queryConfig,
    queryKey: key,
  }

  return useTanstackQuery<Data, Error>(
    { ...parameters } as any,
    queryConfig?.queryClient ?? fallbackQueryClient,
  )
}
