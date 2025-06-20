import { useChainId, useConfig } from 'wagmi'
import { useQuery, type UseQueryReturnType } from 'wagmi/query'
import {
  getEnsNamesForAddressQueryOptions,
  type GetEnsNamesForAddressData,
  type GetEnsNamesForAddressErrorType,
  type GetEnsNamesForAddressOptions,
  type GetEnsNamesForAddressQueryFnData,
  type GetEnsNamesForAddressQueryKey,
} from '../query/getEnsNamesForAddress.js'
import type { ConfigWithEns } from '../types/config.js'
import type { ConfigParameter, QueryParameter } from '../types/properties.js'
import type { ResolvedRegister } from '../types/register.js'
import type { Compute } from '../types/utils.js'

export type UseEnsNamesForAddressParameters<
  config extends ConfigWithEns = ConfigWithEns,
  selectData = GetEnsNamesForAddressData,
> = Compute<
  GetEnsNamesForAddressOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetEnsNamesForAddressQueryFnData,
      GetEnsNamesForAddressErrorType,
      selectData,
      GetEnsNamesForAddressQueryKey<config>
    >
>

export type UseEnsNamesForAddressReturnType<
  selectData = GetEnsNamesForAddressData,
> = UseQueryReturnType<selectData, GetEnsNamesForAddressErrorType>

/**
 * Returns a list of names for an address
 *
 * Keep in mind that this list will be loaded from the subgraph, and only include watchable names.
 * Read more about enumeration and watchability here: https://docs.ens.domains/web/enumerate
 *
 * @param parameters - {@link UseEnsNamesForAddressParameters}
 * @returns - {@link UseEnsNamesForAddressReturnType}
 */
export const useEnsNamesForAddress = <
  config extends ConfigWithEns = ResolvedRegister['config'],
  selectData = GetEnsNamesForAddressData,
>(
  parameters: UseEnsNamesForAddressParameters<config, selectData> = {},
): UseEnsNamesForAddressReturnType<selectData> => {
  const { address, query = {} } = parameters

  const config = useConfig<ConfigWithEns>()
  const chainId = useChainId({ config })

  const options = getEnsNamesForAddressQueryOptions(config, {
    ...parameters,
    chainId: parameters.chainId ?? chainId,
  })
  const enabled = Boolean(address && (query.enabled ?? true))

  return useQuery({ ...query, ...options, enabled })
}
