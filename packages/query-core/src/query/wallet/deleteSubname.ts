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
  type DeleteSubnameErrorType,
  type DeleteSubnameParameters,
  type DeleteSubnameReturnType,
  deleteSubname,
} from '../../actions/wallet/deleteSubname.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type DeleteSubnameOptions<config extends Config> = Compute<
  ExactPartial<DeleteSubnameParameters<config>> & ScopeKeyParameter
>

export function deleteSubnameMutationOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<chains, 'ensRegistry' | 'ensNameWrapper'>,
  options: DeleteSubnameOptions<ExcludeTE<typeof config>>,
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    mutationFn: async (variables: DeleteSubnameParameters<typeof config>) => {
      return deleteSubname(config, variables)
    },
    mutationKey: deleteSubnameMutationKey(options),
  } as const satisfies MutationOptions<
    DeleteSubnameReturnType,
    DeleteSubnameErrorType,
    DeleteSubnameParameters<typeof config>
  >
}

export function deleteSubnameMutationKey<config extends Config>(
  options: DeleteSubnameOptions<config>,
) {
  return ['ensjs_deleteSubname', filterQueryOptions(options)] as const
}

export type DeleteSubnameMutationKey<config extends Config> = ReturnType<
  typeof deleteSubnameMutationKey<config>
>
