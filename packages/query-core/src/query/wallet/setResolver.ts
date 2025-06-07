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
  type SetResolverErrorType,
  type SetResolverParameters,
  type SetResolverReturnType,
  setResolver,
} from '../../actions/wallet/setResolver.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type SetResolverOptions<config extends Config> = Compute<
  ExactPartial<SetResolverParameters<config>> & ScopeKeyParameter
>

export function setResolverMutationOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<chains, 'ensRegistry' | 'ensNameWrapper'>,
  options: SetResolverOptions<ExcludeTE<typeof config>>,
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    mutationFn: async (variables: SetResolverParameters<typeof config>) => {
      return setResolver(config, variables)
    },
    mutationKey: setResolverMutationKey(options),
  } as const satisfies MutationOptions<
    SetResolverReturnType,
    SetResolverErrorType,
    SetResolverParameters<typeof config>
  >
}

export function setResolverMutationKey<config extends Config>(
  options: SetResolverOptions<config>,
) {
  return ['ensjs_setResolver', filterQueryOptions(options)] as const
}

export type SetResolverMutationKey<config extends Config> = ReturnType<
  typeof setResolverMutationKey<config>
>
