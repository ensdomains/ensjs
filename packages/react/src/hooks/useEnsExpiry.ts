import { useChainId, useConfig } from 'wagmi'
import { useQuery, type UseQueryReturnType } from 'wagmi/query'
import {
  getEnsExpiryQueryOptions,
  type GetEnsExpiryData,
  type GetEnsExpiryErrorType,
  type GetEnsExpiryOptions,
  type GetEnsExpiryQueryFnData,
  type GetEnsExpiryQueryKey,
} from '../query/getEnsExpiry.js'
import type { ConfigWithEns } from '../types/config.js'
import type { ConfigParameter, QueryParameter } from '../types/properties.js'
import type { ResolvedRegister } from '../types/register.js'
import type { Compute } from '../types/utils.js'

export type UseEnsExpiryParameters<
  config extends ConfigWithEns = ConfigWithEns,
  selectData = GetEnsExpiryData,
> = Compute<
  GetEnsExpiryOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetEnsExpiryQueryFnData,
      GetEnsExpiryErrorType,
      selectData,
      GetEnsExpiryQueryKey<config>
    >
>

export type UseEnsExpiryReturnType<selectData = GetEnsExpiryData> =
  UseQueryReturnType<selectData, GetEnsExpiryErrorType>

/**
 * Returns expiry of a name
 *
 * Keep in mind that this function is limited to second-level .eth names (luc.eth, nick.eth, etc)
 *
 * @param parameters - {@link UseEnsExpiryParameters}
 * @returns - {@link UseEnsExpiryReturnType}
 */
export const useEnsExpiry = <
  config extends ConfigWithEns = ResolvedRegister['config'],
  selectData = GetEnsExpiryData,
>(
  parameters: UseEnsExpiryParameters<config, selectData> = {},
): UseEnsExpiryReturnType<selectData> => {
  const { name, query = {} } = parameters

  const config = useConfig<ConfigWithEns>()
  const chainId = useChainId({ config })

  const options = getEnsExpiryQueryOptions(config, {
    ...parameters,
    chainId: parameters.chainId ?? chainId,
  })
  const enabled = Boolean(name && (query.enabled ?? true))

  return useQuery({ ...query, ...options, enabled })
}
