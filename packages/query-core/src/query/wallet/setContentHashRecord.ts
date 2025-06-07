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
  type SetContentHashRecordErrorType,
  type SetContentHashRecordParameters,
  type SetContentHashRecordReturnType,
  setContentHashRecord,
} from '../../actions/wallet/setContentHashRecord.js'
import { filterQueryOptions } from '../utils.js'

export type SetContentHashRecordOptions<config extends Config> = Compute<
  ExactPartial<SetContentHashRecordParameters<config>> & ScopeKeyParameter
>

export function setContentHashRecordMutationOptions<config extends Config>(
  config: config,
  options: SetContentHashRecordOptions<ExcludeTE<typeof config>>,
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    mutationFn: async (variables: SetContentHashRecordParameters<config>) => {
      return setContentHashRecord(config, variables)
    },
    mutationKey: setContentHashRecordMutationKey(options),
  } as const satisfies MutationOptions<
    SetContentHashRecordReturnType,
    SetContentHashRecordErrorType,
    SetContentHashRecordParameters<config>
  >
}

export function setContentHashRecordMutationKey<config extends Config>(
  options: SetContentHashRecordOptions<config>,
) {
  return ['ensjs_setContentHashRecord', filterQueryOptions(options)] as const
}

export type SetContentHashRecordMutationKey<config extends Config> = ReturnType<
  typeof setContentHashRecordMutationKey<config>
>
