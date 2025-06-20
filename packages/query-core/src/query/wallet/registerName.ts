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
  type RegisterNameErrorType,
  type RegisterNameParameters,
  type RegisterNameReturnType,
  registerName,
} from '../../actions/wallet/registerName.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type RegisterNameOptions<config extends Config> = Compute<
  ExactPartial<RegisterNameParameters<config>> & ScopeKeyParameter
>

export function registerNameMutationOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<chains, 'ensEthRegistrarController'>,
  options: RegisterNameOptions<ExcludeTE<typeof config>>,
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    mutationFn: async (variables: RegisterNameParameters<typeof config>) => {
      return registerName(config, variables)
    },
    mutationKey: registerNameMutationKey(options),
  } as const satisfies MutationOptions<
    RegisterNameReturnType,
    RegisterNameErrorType,
    RegisterNameParameters<typeof config>
  >
}

export function registerNameMutationKey<config extends Config>(
  options: RegisterNameOptions<config>,
) {
  return ['ensjs_registerName', filterQueryOptions(options)] as const
}

export type RegisterNameMutationKey<config extends Config> = ReturnType<
  typeof registerNameMutationKey<config>
>
