import {
  type GetRecordsErrorType as ensjs_GetEnsRecordsErrorType,
  type GetRecordsParameters as ensjs_GetEnsRecordsParameters,
  type GetRecordsReturnType as ensjs_GetEnsRecordsReturnType,
  getRecords,
} from '@ensdomains/ensjs/public'
import type { QueryOptions } from '@tanstack/react-query'
import type { ConfigWithEns } from '../types/config.js'
import type {
  ChainIdParameter,
  ScopeKeyParameter,
} from '../types/properties.js'
import type { Compute, ExactPartial } from '../types/utils.js'
import { filterQueryOptions, getClientAndParameters } from './utils.js'

export type GetEnsRecordsParameters<
  config extends ConfigWithEns = ConfigWithEns,
  texts extends readonly string[] | undefined = undefined,
  coins extends readonly (string | number)[] | undefined = undefined,
  contentHash extends boolean | undefined = undefined,
  abi extends boolean | undefined = undefined,
> = Compute<
  ensjs_GetEnsRecordsParameters<texts, coins, contentHash, abi> &
    ChainIdParameter<config>
>

export type GetEnsRecordsReturnType<
  texts extends readonly string[] | undefined = undefined,
  coins extends readonly (string | number)[] | undefined = undefined,
  contentHash extends boolean | undefined = undefined,
  abi extends boolean | undefined = undefined,
> = ensjs_GetEnsRecordsReturnType<texts, coins, contentHash, abi>

export type GetEnsRecordsErrorType = ensjs_GetEnsRecordsErrorType

export type GetEnsRecordsOptions<
  config extends ConfigWithEns = ConfigWithEns,
  texts extends readonly string[] | undefined = undefined,
  coins extends readonly (string | number)[] | undefined = undefined,
  contentHash extends boolean | undefined = undefined,
  abi extends boolean | undefined = undefined,
> = Compute<
  ExactPartial<
    GetEnsRecordsParameters<config, texts, coins, contentHash, abi>
  > &
    ScopeKeyParameter
>

export type GetEnsRecordsQueryFnData<
  texts extends readonly string[] | undefined = undefined,
  coins extends readonly (string | number)[] | undefined = undefined,
  contentHash extends boolean | undefined = undefined,
  abi extends boolean | undefined = undefined,
> = GetEnsRecordsReturnType<texts, coins, contentHash, abi>

export type GetEnsRecordsData<
  texts extends readonly string[] | undefined = undefined,
  coins extends readonly (string | number)[] | undefined = undefined,
  contentHash extends boolean | undefined = undefined,
  abi extends boolean | undefined = undefined,
> = GetEnsRecordsReturnType<texts, coins, contentHash, abi>

export const getEnsRecordsQueryKey = <
  config extends ConfigWithEns,
  texts extends readonly string[] | undefined,
  coins extends readonly (string | number)[] | undefined,
  contentHash extends boolean | undefined,
  abi extends boolean | undefined,
>(
  options: GetEnsRecordsOptions<config, texts, coins, contentHash, abi>,
) => {
  return ['getEnsRecords', filterQueryOptions(options)] as const
}

export type GetEnsRecordsQueryKey<
  config extends ConfigWithEns,
  texts extends readonly string[] | undefined,
  coins extends readonly (string | number)[] | undefined,
  contentHash extends boolean | undefined,
  abi extends boolean | undefined,
> = ReturnType<
  typeof getEnsRecordsQueryKey<config, texts, coins, contentHash, abi>
>

export const getEnsRecordsQueryOptions = <
  config extends ConfigWithEns,
  const texts extends readonly string[] | undefined = undefined,
  const coins extends readonly (string | number)[] | undefined = undefined,
  const contentHash extends boolean | undefined = undefined,
  const abi extends boolean | undefined = undefined,
>(
  config: config,
  options: GetEnsRecordsOptions<config, texts, coins, contentHash, abi> = {},
) => {
  return {
    async queryFn({ queryKey }) {
      const { name, ...rest } = queryKey[1]
      if (!name) throw new Error('name is required')

      const { client, parameters } = getClientAndParameters(config, {
        ...rest,
        name,
      })
      return getRecords(client, parameters) as any
    },
    queryKey: getEnsRecordsQueryKey(options),
  } as const satisfies QueryOptions<
    GetEnsRecordsQueryFnData<texts, coins, contentHash, abi>,
    GetEnsRecordsErrorType,
    GetEnsRecordsData<texts, coins, contentHash, abi>,
    GetEnsRecordsQueryKey<config, texts, coins, contentHash, abi>
  >
}
