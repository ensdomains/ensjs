import { useChainId, useConfig } from 'wagmi'
import { useQuery, type UseQueryReturnType } from 'wagmi/query'
import {
  getEnsCredentialsQueryOptions,
  type GetEnsCredentialsData,
  type GetEnsCredentialsErrorType,
  type GetEnsCredentialsOptions,
  type GetEnsCredentialsQueryFnData,
  type GetEnsCredentialsQueryKey,
} from '../query/getEnsCredentials.js'
import type { ConfigWithEns } from '../types/config.js'
import type { ConfigParameter, QueryParameter } from '../types/properties.js'
import type { ResolvedRegister } from '../types/register.js'
import type { Compute } from '../types/utils.js'

export type UseEnsCredentialsParameters<
  config extends ConfigWithEns = ConfigWithEns,
  selectData = GetEnsCredentialsData,
> = Compute<
  GetEnsCredentialsOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetEnsCredentialsQueryFnData,
      GetEnsCredentialsErrorType,
      selectData,
      GetEnsCredentialsQueryKey<config>
    >
>

export type UseEnsCredentialsReturnType<selectData = GetEnsCredentialsData> =
  UseQueryReturnType<selectData, GetEnsCredentialsErrorType>

/**
 * Returns credentials from a name
 *
 * @param parameters - {@link UseEnsCredentialsParameters}
 * @returns - {@link UseEnsCredentialsReturnType}
 *
 * @beta
 */
export const useEnsCredentials = <
  config extends ConfigWithEns = ResolvedRegister['config'],
  selectData = GetEnsCredentialsData,
>(
  parameters: UseEnsCredentialsParameters<config, selectData> = {},
): UseEnsCredentialsReturnType<selectData> => {
  const { name, query = {} } = parameters

  const config = useConfig<ConfigWithEns>()
  const chainId = useChainId({ config })

  const options = getEnsCredentialsQueryOptions(config, {
    ...parameters,
    chainId: parameters.chainId ?? chainId,
  })
  const enabled = Boolean(name && (query.enabled ?? true))

  return useQuery({ ...query, ...options, enabled })
}
