import { useChainId, useConfig } from 'wagmi'
import { useQuery, type UseQueryReturnType } from 'wagmi/query'
import {
  getEnsAvailableQueryOptions,
  type GetEnsAvailableData,
  type GetEnsAvailableErrorType,
  type GetEnsAvailableOptions,
  type GetEnsAvailableQueryFnData,
  type GetEnsAvailableQueryKey,
} from '../query/getEnsAvailable.js'
import type { ConfigWithEns } from '../types/config.js'
import type { ConfigParameter, QueryParameter } from '../types/properties.js'
import type { ResolvedRegister } from '../types/register.js'
import type { Compute } from '../types/utils.js'

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
