import {
  useQuery as useTanstackQuery,
  type DefaultError,
  type QueryClient,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query'
import type { ExactPartial } from 'viem'
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
> = UseQueryResult<Data, Error>

export const useQuery = <Parameters, Data, Error>(
  key: QueryKey,
  queryParameters: Exclude<Parameters, 'queryKey'>,
  queryClient?: QueryClient,
): UseQueryReturnType<Data, Error> => {
  const parameters = {
    ...queryParameters,
    queryKey: key,
  }

  // TODO: figure out why this is necessary
  // @ts-ignore
  return useTanstackQuery(
    { ...parameters } as any,
    queryClient ?? fallbackQueryClient,
  )
}
