/* biome-ignore-all lint/correctness/noUnusedVariables: just for destructuring */

export function filterQueryOptions<type extends Record<string, unknown>>(
  options: type,
): type {
  // destructuring is super fast
  // biome-ignore format: no formatting
  const {
      // import('@tanstack/query-core').QueryOptions
      _defaulted, behavior, gcTime, initialData, initialDataUpdatedAt, maxPages, meta, networkMode, queryFn, queryHash, queryKey, queryKeyHashFn, retry, retryDelay, structuralSharing,
  
      // import('@tanstack/query-core').InfiniteQueryObserverOptions
      getPreviousPageParam, getNextPageParam, initialPageParam,
  
      // import('@tanstack/react-query').UseQueryOptions
      _optimisticResults, enabled, notifyOnChangeProps, placeholderData, refetchInterval, refetchIntervalInBackground, refetchOnMount, refetchOnReconnect, refetchOnWindowFocus, retryOnMount, select, staleTime, suspense, throwOnError,
  
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // wagmi
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      config, connector, query,
      ...rest
    } = options

  return rest as type
}
