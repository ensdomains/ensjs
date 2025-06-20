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
  type SetRecordsErrorType,
  type SetRecordsParameters,
  type SetRecordsReturnType,
  setRecords,
} from '../../actions/wallet/setRecords.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type SetRecordsOptions<config extends Config> = Compute<
  ExactPartial<SetRecordsParameters<config>> & ScopeKeyParameter
>

export function setRecordsMutationOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<chains, 'ensPublicResolver'>,
  options: SetRecordsOptions<ExcludeTE<typeof config>>,
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    mutationFn: async (variables: SetRecordsParameters<typeof config>) => {
      return setRecords(config, variables)
    },
    mutationKey: setRecordsMutationKey(options),
  } as const satisfies MutationOptions<
    SetRecordsReturnType,
    SetRecordsErrorType,
    SetRecordsParameters<typeof config>
  >
}

export function setRecordsMutationKey<config extends Config>(
  options: SetRecordsOptions<config>,
) {
  return ['ensjs_setRecords', filterQueryOptions(options)] as const
}

export type SetRecordsMutationKey<config extends Config> = ReturnType<
  typeof setRecordsMutationKey<config>
>
