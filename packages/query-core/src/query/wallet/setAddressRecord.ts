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
  type SetAddressRecordErrorType,
  type SetAddressRecordParameters,
  type SetAddressRecordReturnType,
  setAddressRecord,
} from '../../actions/wallet/setAddressRecord.js'
import { filterQueryOptions } from '../utils.js'

export type SetAddressRecordOptions<config extends Config> = Compute<
  ExactPartial<SetAddressRecordParameters<config>> & ScopeKeyParameter
>

export function setAddressRecordMutationOptions<config extends Config>(
  config: config,
  options: SetAddressRecordOptions<ExcludeTE<typeof config>>,
) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    mutationFn: async (variables: SetAddressRecordParameters<config>) => {
      return setAddressRecord(config, variables)
    },
    mutationKey: setAddressRecordMutationKey(options),
  } as const satisfies MutationOptions<
    SetAddressRecordReturnType,
    SetAddressRecordErrorType,
    SetAddressRecordParameters<config>
  >
}

export function setAddressRecordMutationKey<config extends Config>(
  options: SetAddressRecordOptions<config>,
) {
  return ['ensjs_setAddressRecord', filterQueryOptions(options)] as const
}

export type SetAddressRecordMutationKey<config extends Config> = ReturnType<
  typeof setAddressRecordMutationKey<config>
>
