import {
  type GetAvailableParameters,
  type GetAvailableReturnType,
  getAvailable,
} from '@ensdomains/ensjs/public'
import { useChainId, useConfig } from 'wagmi'
import { type UseQueryReturnType, useQuery } from 'wagmi/query'
import type { ParamWithClients, QueryConfig } from '../client.js'
import { type UseQueryReturnType, useQuery } from './useQuery.js'

export type UseEnsAvailableParameters<
  config extends ConfigWithEns = ConfigWithEns,
  selectData = GetEnsAvailableData,
> = Compute<
  GetEnsAvailableOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetEnsAvailableQueryFnData,
      GetEnsAvailableErrorType,
      selectData,
      GetEnsAvailableQueryKey<config>
    >
>

export type UseEnsAvailableReturnType<selectData = GetEnsAvailableData> =
  UseQueryReturnType<selectData, GetEnsAvailableErrorType>

/**
 * Check if a .eth name is available
 *
 * @param parameters - {@link UseEnsAvailableParameters}
 * @returns - {@link UseEnsAvailableReturnType}
 */
export const useEnsAvailable = <
  config extends ConfigWithEns = ResolvedRegister['config'],
  selectData = GetEnsAvailableData,
>(
  parameters: UseEnsAvailableParameters<config, selectData> = {},
): UseEnsAvailableReturnType<selectData> => {
  const { name, query = {} } = parameters

  const config = useConfig<ConfigWithEns>()
  const chainId = useChainId({ config })

  const options = getEnsAvailableQueryOptions(config, {
    ...parameters,
    chainId: parameters.chainId ?? chainId,
  })
  const enabled = Boolean(name && (query.enabled ?? true))

  return useQuery({ ...query, ...options, enabled })
}
