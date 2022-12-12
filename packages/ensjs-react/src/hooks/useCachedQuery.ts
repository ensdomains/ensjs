import {
  QueryFunction,
  QueryKey,
  QueryObserverResult,
  UseQueryOptions,
} from '@tanstack/react-query'
import { useQuery } from 'wagmi'

export type UseQueryResult<TData, TError> = Pick<
  QueryObserverResult<TData, TError>,
  | 'data'
  | 'error'
  | 'fetchStatus'
  | 'isError'
  | 'isFetched'
  | 'isFetchedAfterMount'
  | 'isFetching'
  | 'isLoading'
  | 'isRefetching'
  | 'isSuccess'
  | 'refetch'
> & {
  isCachedData: boolean
  isIdle: boolean
  status: 'idle' | 'loading' | 'success' | 'error'
  internal: Pick<
    QueryObserverResult,
    | 'dataUpdatedAt'
    | 'errorUpdatedAt'
    | 'failureCount'
    | 'isLoadingError'
    | 'isPaused'
    | 'isPlaceholderData'
    | 'isPreviousData'
    | 'isRefetchError'
    | 'isStale'
    | 'remove'
  >
}
export type DefinedUseQueryResult<TData = unknown, TError = unknown> = Omit<
  UseQueryResult<TData, TError>,
  'data'
> & {
  data: TData
}

export function useCachedQuery<
  TQueryFnData,
  TError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: TQueryKey,
  queryFn: QueryFunction<TQueryFnData, TQueryKey>,
  options?: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): UseQueryResult<TData, TError> {
  const query = useQuery<TQueryFnData, TError, TData, TQueryKey>(
    queryKey,
    queryFn,
    options as any,
  )
  const { isFetched, isFetchedAfterMount, status } = query

  return {
    ...query,
    isCachedData: status === 'success' && isFetched && !isFetchedAfterMount,
  }
}
