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
  type ClearRecordsErrorType,
  type ClearRecordsParameters,
  type ClearRecordsReturnType,
  clearRecords,
} from '../../actions/wallet/clearRecords.js'
import type { RequireConfigContracts } from '../../utils/chain.js'
import { filterQueryOptions } from '../utils.js'

export type ClearRecordsOptions<config extends Config> = Compute<
  ExactPartial<ClearRecordsParameters<config>> & ScopeKeyParameter
>

export function clearRecordsMutationOptions<
  chains extends readonly [Chain, ...Chain[]],
>(
  config: RequireConfigContracts<chains, 'ensUniversalResolver'>,
  options: ClearRecordsOptions<ExcludeTE<typeof config>>,
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    mutationFn: async (variables: ClearRecordsParameters<typeof config>) => {
      return clearRecords(config, variables)
    },
    mutationKey: clearRecordsMutationKey(options),
  } as const satisfies MutationOptions<
    ClearRecordsReturnType,
    ClearRecordsErrorType,
    ClearRecordsParameters<typeof config>
  >
}

export function clearRecordsMutationKey<config extends Config>(
  options: ClearRecordsOptions<config>,
) {
  return ['ensjs_clearRecords', filterQueryOptions(options)] as const
}

export type ClearRecordsMutationKey<config extends Config> = ReturnType<
  typeof clearRecordsMutationKey<config>
>
