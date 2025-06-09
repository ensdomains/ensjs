import { ASSERT_NO_TYPE_ERROR } from '@ensdomains/ensjs/internal'
import type { AbiEncodeAs } from '@ensdomains/ensjs/utils'
import type { MutationOptions } from '@tanstack/query-core'
import type { Config } from '@wagmi/core'
import type {
  Compute,
  ExactPartial,
  ScopeKeyParameter,
} from '@wagmi/core/internal'
import {
  type SetAbiRecordErrorType,
  type SetAbiRecordParameters,
  type SetAbiRecordReturnType,
  setAbiRecord,
} from '../../actions/wallet/setAbiRecord.js'
import { filterQueryOptions } from '../utils.js'

export type SetAbiRecordOptions<
  encodeAs extends AbiEncodeAs,
  config extends Config,
> = Compute<
  ExactPartial<SetAbiRecordParameters<encodeAs, config>> & ScopeKeyParameter
>

export function setAbiRecordMutationOptions<
  encodeAs extends AbiEncodeAs,
  config extends Config,
>(config: config, options: SetAbiRecordOptions<encodeAs, config>) {
  ASSERT_NO_TYPE_ERROR(config)

  return {
    mutationFn: async (variables: SetAbiRecordParameters<encodeAs, config>) => {
      return setAbiRecord(config, variables)
    },
    mutationKey: setAbiRecordMutationKey(options),
  } as const satisfies MutationOptions<
    SetAbiRecordReturnType,
    SetAbiRecordErrorType,
    SetAbiRecordParameters<encodeAs, config>
  >
}

export function setAbiRecordMutationKey<
  encodeAs extends AbiEncodeAs,
  config extends Config,
>(options: SetAbiRecordOptions<encodeAs, config>) {
  return ['ensjs_setAbiRecord', filterQueryOptions(options)] as const
}

export type SetAbiRecordMutationKey<
  encodeAs extends AbiEncodeAs,
  config extends Config,
> = ReturnType<typeof setAbiRecordMutationKey<encodeAs, config>>
