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
  type RenewNameErrorType,
  type RenewNameParameters,
  type RenewNameReturnType,
  renewName,
} from '../../actions/wallet/renewName.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type RenewNameOptions<config extends Config> = Compute<
  ExactPartial<RenewNameParameters<config>> & ScopeKeyParameter
>

export function renewNameMutationOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<chains, 'ensEthRenewerV1'>,
  options: RenewNameOptions<ExcludeTE<typeof config>>,
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    mutationFn: async (variables: RenewNameParameters<typeof config>) => {
      return renewName(config, variables)
    },
    mutationKey: renewNameMutationKey(options),
  } as const satisfies MutationOptions<
    RenewNameReturnType,
    RenewNameErrorType,
    RenewNameParameters<typeof config>
  >
}

export function renewNameMutationKey<config extends Config>(
  options: RenewNameOptions<config>,
) {
  return ['ensjs_renewName', filterQueryOptions(options)] as const
}

export type RenewNameMutationKey<config extends Config> = ReturnType<
  typeof renewNameMutationKey<config>
>
