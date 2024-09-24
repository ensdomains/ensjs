import { useChainId, useConfig } from 'wagmi'
import { useQuery, type UseQueryReturnType } from 'wagmi/query'
import {
  getEnsAddressQueryOptions,
  type GetEnsAddressData,
  type GetEnsAddressErrorType,
  type GetEnsAddressOptions,
  type GetEnsAddressQueryFnData,
  type GetEnsAddressQueryKey,
} from '../query/getEnsAddress.js'
import type { ConfigWithEns } from '../types/config.js'
import type { ConfigParameter, QueryParameter } from '../types/properties.js'
import type { ResolvedRegister } from '../types/register.js'
import type { Compute } from '../types/utils.js'

export type UseEnsAddressParameters<
  config extends ConfigWithEns = ConfigWithEns,
  selectData = GetEnsAddressData,
> = Compute<
  GetEnsAddressOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetEnsAddressQueryFnData,
      GetEnsAddressErrorType,
      selectData,
      GetEnsAddressQueryKey<config>
    >
>

export type UseEnsAddressReturnType<selectData = GetEnsAddressData> =
  UseQueryReturnType<selectData, GetEnsAddressErrorType>

/**
 * Returns the address for a name
 *
 * @param parameters - {@link UseEnsAddressParameters}
 * @returns - {@link UseEnsAddressReturnType}
 */
export const useEnsAddress = <
  config extends ConfigWithEns = ResolvedRegister['config'],
  selectData = GetEnsAddressData,
>(
  parameters: UseEnsAddressParameters<config, selectData> = {},
): UseEnsAddressReturnType<selectData> => {
  const { name, query = {} } = parameters

  const config = useConfig<ConfigWithEns>()
  const chainId = useChainId({ config })

  const options = getEnsAddressQueryOptions(config, {
    ...parameters,
    chainId: parameters.chainId ?? chainId,
  })
  const enabled = Boolean(name && (query.enabled ?? true))

  return useQuery({ ...query, ...options, enabled })
}
