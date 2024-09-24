import { useChainId, useConfig } from 'wagmi'
import { useQuery, type UseQueryReturnType } from 'wagmi/query'
import {
  getDecodedNameQueryOptions,
  type GetDecodedNameData,
  type GetDecodedNameErrorType,
  type GetDecodedNameOptions,
  type GetDecodedNameQueryFnData,
  type GetDecodedNameQueryKey,
} from '../query/getDecodedName.js'
import type { ConfigWithEns } from '../types/config.js'
import type { ConfigParameter, QueryParameter } from '../types/properties.js'
import type { ResolvedRegister } from '../types/register.js'
import type { Compute } from '../types/utils.js'

export type UseDecodedNameParameters<
  config extends ConfigWithEns = ConfigWithEns,
  selectData = GetDecodedNameData,
> = Compute<
  GetDecodedNameOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetDecodedNameQueryFnData,
      GetDecodedNameErrorType,
      selectData,
      GetDecodedNameQueryKey<config>
    >
>

export type UseDecodedNameReturnType<selectData = GetDecodedNameData> =
  UseQueryReturnType<selectData, GetDecodedNameErrorType>

/**
 * Decode names returned using the subgraph
 *
 * Performs network request only if the name needs to be decoded, otherwise transparent
 *
 * @param params - {@link UseDecodedNameParams}
 * @returns - {@link GetDecodedNameReturnType}
 */
export const useDecodedName = <
  config extends ConfigWithEns = ResolvedRegister['config'],
  selectData = GetDecodedNameData,
>(
  parameters: UseDecodedNameParameters<config, selectData> = {},
): UseDecodedNameReturnType<selectData> => {
  const { name, query = {} } = parameters

  const config = useConfig<ConfigWithEns>()
  const chainId = useChainId({ config })

  const options = getDecodedNameQueryOptions(config, {
    ...parameters,
    chainId: parameters.chainId ?? chainId,
  })
  const enabled = Boolean(name && (query.enabled ?? true))

  return useQuery({ ...query, ...options, enabled })
}
