import {
  ASSERT_NO_TYPE_ERROR,
  type ExcludeTE,
} from '@ensdomains/ensjs/internal'
import type { MutationOptions } from '@tanstack/query-core'
import type { Config } from '@wagmi/core'
import type {
  Compute,
  ExactPartial,
  ScopeKeyParameter,
} from '@wagmi/core/internal'
import type { Chain } from 'viem'
import {
  type RenewNamesErrorType,
  type RenewNamesParameters,
  type RenewNamesReturnType,
  renewNames,
} from '../../actions/wallet/renewNames.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type RenewNamesOptions<config extends Config> = Compute<
  ExactPartial<RenewNamesParameters<config>> & ScopeKeyParameter
>

export function renewNamesMutationOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<
    chains,
    'ensEthRegistrarController' | 'ensBulkRenewal'
  >,
  options: RenewNamesOptions<ExcludeTE<typeof config>>,
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    mutationFn: async (variables: RenewNamesParameters<typeof config>) => {
      return renewNames(config, variables)
    },
    mutationKey: renewNamesMutationKey(options),
  } as const satisfies MutationOptions<
    RenewNamesReturnType,
    RenewNamesErrorType,
    RenewNamesParameters<typeof config>
  >
}

export function renewNamesMutationKey<config extends Config>(
  options: RenewNamesOptions<config>,
) {
  return ['ensjs_renewNames', filterQueryOptions(options)] as const
}

export type RenewNamesMutationKey<config extends Config> = ReturnType<
  typeof renewNamesMutationKey<config>
>
