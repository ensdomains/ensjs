import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import type { QueryOptions } from '@tanstack/query-core'
import type { Config } from '@wagmi/core'
import type {
  Compute,
  ExactPartial,
  ScopeKeyParameter,
} from '@wagmi/core/internal'
import type { Chain } from 'viem'
import {
  type GetCredentialsErrorType,
  type GetCredentialsParameters,
  type GetCredentialsReturnType,
  getCredentials,
} from '../../actions/public/getCredentials.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type GetCredentialsOptions<config extends Config> = Compute<
  ExactPartial<GetCredentialsParameters<config>> & ScopeKeyParameter
>

export function getCredentialsQueryOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<chains, 'ensUniversalResolver'>,
  options: GetCredentialsOptions<ExcludeTE<typeof config>> = {},
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    async queryFn({ queryKey }) {
      const { name, scopeKey: _, ...parameters } = queryKey[1]
      if (!name) throw new Error('name is required')
      return getCredentials<chains>(config, { ...parameters, name })
    },
    queryKey: getCredentialsQueryKey(options),
  } as const satisfies QueryOptions<
    GetCredentialsQueryFnData,
    GetCredentialsErrorType,
    GetCredentialsData,
    GetCredentialsQueryKey<typeof config>
  >
}

export type GetCredentialsQueryFnData = GetCredentialsReturnType

export type GetCredentialsData = GetCredentialsQueryFnData

export function getCredentialsQueryKey<config extends Config>(
  options: GetCredentialsOptions<config> = {},
) {
  return ['ensjs_credentials', filterQueryOptions(options)] as const
}

export type GetCredentialsQueryKey<config extends Config> = ReturnType<
  typeof getCredentialsQueryKey<config>
>
