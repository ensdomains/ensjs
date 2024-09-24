import { useChainId, useConfig } from 'wagmi'
import { useQuery, type UseQueryReturnType } from 'wagmi/query'
import {
  getEnsContentHashQueryOptions,
  type GetEnsContentHashData,
  type GetEnsContentHashErrorType,
  type GetEnsContentHashOptions,
  type GetEnsContentHashQueryFnData,
  type GetEnsContentHashQueryKey,
} from '../query/getEnsContentHash.js'
import type { ConfigWithEns } from '../types/config.js'
import type { ConfigParameter, QueryParameter } from '../types/properties.js'
import type { ResolvedRegister } from '../types/register.js'
import type { Compute } from '../types/utils.js'

export type UseEnsContentHashParameters<
  config extends ConfigWithEns = ConfigWithEns,
  selectData = GetEnsContentHashData,
> = Compute<
  GetEnsContentHashOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetEnsContentHashQueryFnData,
      GetEnsContentHashErrorType,
      selectData,
      GetEnsContentHashQueryKey<config>
    >
>

export type UseEnsContentHashReturnType<selectData = GetEnsContentHashData> =
  UseQueryReturnType<selectData, GetEnsContentHashErrorType>

/**
 * Returns the content hash for a name
 *
 * @param parameters - {@link UseEnsContentHashParameters}
 * @returns - {@link UseEnsContentHashReturnType}
 */
export const useEnsContentHash = <
  config extends ConfigWithEns = ResolvedRegister['config'],
  selectData = GetEnsContentHashData,
>(
  parameters: UseEnsContentHashParameters<config, selectData> = {},
): UseEnsContentHashReturnType<selectData> => {
  const { name, query = {} } = parameters

  const config = useConfig<ConfigWithEns>()
  const chainId = useChainId({ config })

  const options = getEnsContentHashQueryOptions(config, {
    ...parameters,
    chainId: parameters.chainId ?? chainId,
  })
  const enabled = Boolean(name && (query.enabled ?? true))

  return useQuery({ ...query, ...options, enabled })
}
