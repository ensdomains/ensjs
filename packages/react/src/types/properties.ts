import type { DefaultError, QueryKey } from '@tanstack/react-query'
import type { Connector } from 'wagmi'
import type { UseQueryParameters } from 'wagmi/query'
import type { ConfigWithEns } from './config.js'

export type ChainIdParameter<
  config extends ConfigWithEns,
  chainId extends
    | config['chains'][number]['id']
    | undefined = config['chains'][number]['id'],
> = {
  chainId?:
    | (chainId extends config['chains'][number]['id'] ? chainId : undefined)
    | config['chains'][number]['id']
    | undefined
}

export type ScopeKeyParameter = { scopeKey?: string | undefined }

// TODO(tate): not sure if this is needed yet
export type ConnectorParameter = {
  connector?: Connector | undefined
}

export type QueryParameter<
  queryFnData = unknown,
  error = DefaultError,
  data = queryFnData,
  queryKey extends QueryKey = QueryKey,
> = {
  query?:
    | Omit<
        UseQueryParameters<queryFnData, error, data, queryKey>,
        'queryFn' | 'queryHash' | 'queryKey' | 'queryKeyHashFn' | 'throwOnError'
      >
    | undefined
}

export type ConfigParameter<config extends ConfigWithEns = ConfigWithEns> = {
  config?: ConfigWithEns | config | undefined
}
