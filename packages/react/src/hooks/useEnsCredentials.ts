import { getTextRecord } from '@ensdomains/ensjs/public'
import type { ParamWithClients, QueryConfig } from '../client.js'
import { type UseQueryReturnType, useQuery } from './useQuery.js'

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
