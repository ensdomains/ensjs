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
  type SetPrimaryNameErrorType,
  type SetPrimaryNameParameters,
  type SetPrimaryNameReturnType,
  setPrimaryName,
} from '../../actions/wallet/setPrimaryName.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type SetPrimaryNameOptions<config extends Config> = Compute<
  ExactPartial<SetPrimaryNameParameters<config>> & ScopeKeyParameter
>

export function setPrimaryNameMutationOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<
    chains,
    'ensPublicResolver' | 'ensReverseRegistrar'
  >,
  options: SetPrimaryNameOptions<ExcludeTE<typeof config>>,
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    mutationFn: async (variables: SetPrimaryNameParameters<typeof config>) => {
      return setPrimaryName(config, variables)
    },
    mutationKey: setPrimaryNameMutationKey(options),
  } as const satisfies MutationOptions<
    SetPrimaryNameReturnType,
    SetPrimaryNameErrorType,
    SetPrimaryNameParameters<typeof config>
  >
}

export function setPrimaryNameMutationKey<config extends Config>(
  options: SetPrimaryNameOptions<config>,
) {
  return ['ensjs_setPrimaryName', filterQueryOptions(options)] as const
}

export type SetPrimaryNameMutationKey<config extends Config> = ReturnType<
  typeof setPrimaryNameMutationKey<config>
>
