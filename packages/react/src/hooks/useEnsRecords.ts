import { useChainId, useConfig } from 'wagmi'
import { useQuery, type UseQueryReturnType } from 'wagmi/query'
import {
  getEnsRecordsQueryOptions,
  type GetEnsRecordsData,
  type GetEnsRecordsErrorType,
  type GetEnsRecordsOptions,
  type GetEnsRecordsQueryFnData,
  type GetEnsRecordsQueryKey,
} from '../query/getEnsRecords.js'
import type { ConfigWithEns } from '../types/config.js'
import type { ConfigParameter, QueryParameter } from '../types/properties.js'
import type { ResolvedRegister } from '../types/register.js'
import type { Compute } from '../types/utils.js'

export type UseEnsRecordsParameters<
  config extends ConfigWithEns = ConfigWithEns,
  texts extends readonly string[] | undefined = undefined,
  coins extends readonly (string | number)[] | undefined = undefined,
  contentHash extends boolean | undefined = undefined,
  abi extends boolean | undefined = undefined,
  selectData = GetEnsRecordsData<texts, coins, contentHash, abi>,
> = Compute<
  GetEnsRecordsOptions<config, texts, coins, contentHash, abi> &
    ConfigParameter<config> &
    QueryParameter<
      GetEnsRecordsQueryFnData<texts, coins, contentHash, abi>,
      GetEnsRecordsErrorType,
      selectData,
      GetEnsRecordsQueryKey<config, texts, coins, contentHash, abi>
    >
>

export type UseEnsRecordsReturnType<
  texts extends readonly string[] | undefined = undefined,
  coins extends readonly (string | number)[] | undefined = undefined,
  contentHash extends boolean | undefined = undefined,
  abi extends boolean | undefined = undefined,
  selectData = GetEnsRecordsData<texts, coins, contentHash, abi>,
> = UseQueryReturnType<selectData, GetEnsRecordsErrorType>

/**
 * Returns arbitrary records for a name
 *
 * @param parameters - {@link UseEnsRecordsParameters}
 * @returns - {@link UseEnsRecordsReturnType}
 */
export const useEnsRecords = <
  config extends ConfigWithEns = ResolvedRegister['config'],
  const texts extends readonly string[] | undefined = undefined,
  const coins extends readonly (string | number)[] | undefined = undefined,
  const contentHash extends boolean | undefined = undefined,
  const abi extends boolean | undefined = undefined,
  selectData = GetEnsRecordsData<texts, coins, contentHash, abi>,
>(
  parameters: UseEnsRecordsParameters<
    config,
    texts,
    coins,
    contentHash,
    abi,
    selectData
  > = {},
): UseEnsRecordsReturnType<texts, coins, contentHash, abi, selectData> => {
  const { name, query = {} } = parameters

  const config = useConfig<ConfigWithEns>()
  const chainId = useChainId({ config })

  const options = getEnsRecordsQueryOptions(config, {
    ...parameters,
    chainId: parameters.chainId ?? chainId,
  })
  const enabled = Boolean(name && (query.enabled ?? true))

  return useQuery({ ...query, ...options, enabled })
}
