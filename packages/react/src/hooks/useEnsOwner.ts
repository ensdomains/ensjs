import { useChainId, useConfig } from 'wagmi'
import { useQuery, type UseQueryReturnType } from 'wagmi/query'
import {
  getEnsOwnerQueryOptions,
  type GetEnsOwnerData,
  type GetEnsOwnerErrorType,
  type GetEnsOwnerOptions,
  type GetEnsOwnerQueryFnData,
  type GetEnsOwnerQueryKey,
} from '../query/getEnsOwner.js'
import type { ConfigWithEns } from '../types/config.js'
import type { ConfigParameter, QueryParameter } from '../types/properties.js'
import type { ResolvedRegister } from '../types/register.js'
import type { Compute } from '../types/utils.js'

export type UseEnsOwnerParameters<
  config extends ConfigWithEns = ConfigWithEns,
  selectData = GetEnsOwnerData,
> = Compute<
  GetEnsOwnerOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetEnsOwnerQueryFnData,
      GetEnsOwnerErrorType,
      selectData,
      GetEnsOwnerQueryKey<config>
    >
>

export type UseEnsOwnerReturnType<selectData = GetEnsOwnerData> =
  UseQueryReturnType<selectData, GetEnsOwnerErrorType>

/**
 * Returns the owner of a name
 *
 * @param parameters - {@link UseEnsOwnerParameters}
 * @returns - {@link UseEnsOwnerReturnType}
 */
export const useEnsOwner = <
  config extends ConfigWithEns = ResolvedRegister['config'],
  selectData = GetEnsOwnerData,
>(
  parameters: UseEnsOwnerParameters<config, selectData> = {},
): UseEnsOwnerReturnType<selectData> => {
  const { name, query = {} } = parameters

  const config = useConfig<ConfigWithEns>()
  const chainId = useChainId({ config })

  const options = getEnsOwnerQueryOptions(config, {
    ...parameters,
    chainId: parameters.chainId ?? chainId,
  })
  const enabled = Boolean(name && (query.enabled ?? true))

  return useQuery({ ...query, ...options, enabled })
}
