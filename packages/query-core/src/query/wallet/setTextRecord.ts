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
import {
  type SetTextRecordErrorType,
  type SetTextRecordParameters,
  type SetTextRecordReturnType,
  setTextRecord,
} from '../../actions/wallet/setTextRecord.js'
import { filterQueryOptions } from '../utils.js'

export type SetTextRecordOptions<config extends Config> = Compute<
  ExactPartial<SetTextRecordParameters<config>> & ScopeKeyParameter
>

export function setTextRecordMutationOptions<config extends Config>(
  config: config,
  options: SetTextRecordOptions<ExcludeTE<typeof config>>,
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    mutationFn: async (variables: SetTextRecordParameters<config>) => {
      return setTextRecord(config, variables)
    },
    mutationKey: setTextRecordMutationKey(options),
  } as const satisfies MutationOptions<
    SetTextRecordReturnType,
    SetTextRecordErrorType,
    SetTextRecordParameters<config>
  >
}

export function setTextRecordMutationKey<config extends Config>(
  options: SetTextRecordOptions<config>,
) {
  return ['ensjs_setTextRecord', filterQueryOptions(options)] as const
}

export type SetTextRecordMutationKey<config extends Config> = ReturnType<
  typeof setTextRecordMutationKey<config>
>
