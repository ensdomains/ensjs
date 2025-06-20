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
  type CommitNameErrorType,
  type CommitNameParameters,
  type CommitNameReturnType,
  commitName,
} from '../../actions/wallet/commitName.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type CommitNameOptions<config extends Config> = Compute<
  ExactPartial<CommitNameParameters<config>> & ScopeKeyParameter
>

export function commitNameMutationOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<chains, 'ensEthRegistrarController'>,
  options: CommitNameOptions<ExcludeTE<typeof config>>,
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    mutationFn: async (variables: CommitNameParameters<typeof config>) => {
      return commitName(config, variables)
    },
    mutationKey: commitNameMutationKey(options),
  } as const satisfies MutationOptions<
    CommitNameReturnType,
    CommitNameErrorType,
    CommitNameParameters<typeof config>
  >
}

export function commitNameMutationKey<config extends Config>(
  options: CommitNameOptions<config>,
) {
  return ['ensjs_commitName', filterQueryOptions(options)] as const
}

export type CommitNameMutationKey<config extends Config> = ReturnType<
  typeof commitNameMutationKey<config>
>
