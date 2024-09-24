import { useChainId, useConfig } from 'wagmi'
import { useQuery, type UseQueryReturnType } from 'wagmi/query'
import {
  getEnsAbiQueryOptions,
  type GetEnsAbiData,
  type GetEnsAbiErrorType,
  type GetEnsAbiOptions,
  type GetEnsAbiQueryFnData,
  type GetEnsAbiQueryKey,
} from '../query/getEnsAbi.js'
import type { ConfigWithEns } from '../types/config.js'
import type { ConfigParameter, QueryParameter } from '../types/properties.js'
import type { ResolvedRegister } from '../types/register.js'
import type { Compute } from '../types/utils.js'

export type UseEnsAbiParameters<
  config extends ConfigWithEns = ConfigWithEns,
  selectData = GetEnsAbiData,
> = Compute<
  GetEnsAbiOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetEnsAbiQueryFnData,
      GetEnsAbiErrorType,
      selectData,
      GetEnsAbiQueryKey<config>
    >
>

export type UseEnsAbiReturnType<selectData = GetEnsAbiData> =
  UseQueryReturnType<selectData, GetEnsAbiErrorType>

/**
 * Returns the ABI for a name
 *
 * @param parameters - {@link UseEnsAbiParameters}
 * @returns - {@link UseEnsAbiReturnType}
 */
export const useEnsAbi = <
  config extends ConfigWithEns = ResolvedRegister['config'],
  selectData = GetEnsAbiData,
>(
  parameters: UseEnsAbiParameters<config, selectData> = {},
): UseEnsAbiReturnType<selectData> => {
  const { name, query = {} } = parameters

  const config = useConfig<ConfigWithEns>()
  const chainId = useChainId({ config })

  const options = getEnsAbiQueryOptions(config, {
    ...parameters,
    chainId: parameters.chainId ?? chainId,
  })
  const enabled = Boolean(name && (query.enabled ?? true))

  return useQuery({ ...query, ...options, enabled })
}
