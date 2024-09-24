import { useConfig } from 'wagmi'
import {
  useMutation,
  type UseMutationParameters,
  type UseMutationReturnType,
} from 'wagmi/query'
import {
  writeEnsRecordsMutationOptions,
  type WriteEnsRecordsData,
  type WriteEnsRecordsErrorType,
  type WriteEnsRecordsMutate,
  type WriteEnsRecordsMutateAsync,
  type WriteEnsRecordsVariables,
} from '../query/writeEnsRecords.js'
import type { ConfigWithEns } from '../types/config.js'
import type { ConfigParameter } from '../types/properties.js'
import type { ResolvedRegister } from '../types/register.js'
import type { Compute } from '../types/utils.js'

export type UseWriteEnsRecordsParameters<
  config extends ConfigWithEns = ConfigWithEns,
  context = unknown,
> = Compute<
  ConfigParameter<config> & {
    mutation?:
      | UseMutationParameters<
          WriteEnsRecordsData,
          WriteEnsRecordsErrorType,
          WriteEnsRecordsVariables<config>,
          context
        >
      | undefined
  }
>

export type UseWriteEnsRecordsReturnType<
  config extends ConfigWithEns = ConfigWithEns,
  context = unknown,
> = Compute<
  UseMutationReturnType<
    WriteEnsRecordsData,
    WriteEnsRecordsErrorType,
    WriteEnsRecordsVariables<config>,
    context
  > & {
    writeEnsRecords: WriteEnsRecordsMutate<config, context>
    writeEnsRecordsAsync: WriteEnsRecordsMutateAsync<config, context>
  }
>

export const useWriteEnsRecords = <
  config extends ConfigWithEns = ResolvedRegister['config'],
  context = unknown,
>(
  parameters: UseWriteEnsRecordsParameters<config, context> = {},
): UseWriteEnsRecordsReturnType<config, context> => {
  const { mutation } = parameters

  const config = useConfig(parameters)

  const mutationOptions = writeEnsRecordsMutationOptions(config)
  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    ...mutationOptions,
  })

  type Return = UseWriteEnsRecordsReturnType<config, context>
  return {
    ...result,
    writeEnsRecords: mutate as Return['writeEnsRecords'],
    writeEnsRecordsAsync: mutateAsync as Return['writeEnsRecordsAsync'],
  }
}
