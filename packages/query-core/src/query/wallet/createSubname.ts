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
  type CreateSubnameErrorType,
  type CreateSubnameParameters,
  type CreateSubnameReturnType,
  createSubname,
} from '../../actions/wallet/createSubname.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type CreateSubnameOptions<config extends Config> = Compute<
  ExactPartial<CreateSubnameParameters<config>> & ScopeKeyParameter
>

export function createSubnameMutationOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<
    chains,
    'ensNameWrapper' | 'ensPublicResolver'
  >,
  options: CreateSubnameOptions<ExcludeTE<typeof config>>,
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    mutationFn: async (variables: CreateSubnameParameters<typeof config>) => {
      return createSubname(config, variables)
    },
    mutationKey: createSubnameMutationKey(options),
  } as const satisfies MutationOptions<
    CreateSubnameReturnType,
    CreateSubnameErrorType,
    CreateSubnameParameters<typeof config>
  >
}

export function createSubnameMutationKey<config extends Config>(
  options: CreateSubnameOptions<config>,
) {
  return ['ensjs_createSubname', filterQueryOptions(options)] as const
}

export type CreateSubnameMutationKey<config extends Config> = ReturnType<
  typeof createSubnameMutationKey<config>
>
