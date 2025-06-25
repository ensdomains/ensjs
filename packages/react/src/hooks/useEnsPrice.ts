import { useChainId, useConfig } from 'wagmi'
import { type UseQueryReturnType, useQuery } from 'wagmi/query'
import {
  type GetEnsPriceData,
  type GetEnsPriceErrorType,
  type GetEnsPriceOptions,
  type GetEnsPriceQueryFnData,
  type GetEnsPriceQueryKey,
  getEnsPriceQueryOptions,
} from '../query/getEnsPrice.js'
import type { ConfigWithEns } from '../types/config.js'
import type { ConfigParameter, QueryParameter } from '../types/properties.js'
import type { ResolvedRegister } from '../types/register.js'
import type { Compute } from '../types/utils.js'

export type UseEnsPriceParameters<
  config extends ConfigWithEns = ConfigWithEns,
  selectData = GetEnsPriceData,
> = Compute<
  GetEnsPriceOptions<config> &
    ConfigParameter<config> &
    QueryParameter<
      GetEnsPriceQueryFnData,
      GetEnsPriceErrorType,
      selectData,
      GetEnsPriceQueryKey<config>
    >
>

export type UseEnsPriceReturnType<selectData = GetEnsPriceData> =
  UseQueryReturnType<selectData, GetEnsPriceErrorType>

/**
 * Returns the price for registering or renewing a name
 *
 * @param parameters - {@link UseEnsPriceParameters}
 * @returns - {@link UseEnsPriceReturnType}
 */
export const useEnsPrice = <
  config extends ConfigWithEns = ResolvedRegister['config'],
  selectData = GetEnsPriceData,
>(
  parameters: UseEnsPriceParameters<config, selectData> = {},
): UseEnsPriceReturnType<selectData> => {
  const { nameOrNames, duration, query = {} } = parameters

  const config = useConfig<ConfigWithEns>()
  const chainId = useChainId({ config })

  const options = getEnsPriceQueryOptions(config, {
    ...parameters,
    chainId: parameters.chainId ?? chainId,
  })
  const enabled = Boolean(nameOrNames && duration && (query.enabled ?? true))

  return useQuery({ ...query, ...options, enabled })
}
