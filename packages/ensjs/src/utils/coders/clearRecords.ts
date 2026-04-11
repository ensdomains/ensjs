import { publicResolverClearRecordsSnippet } from '@ensdomains/ensjs-abi/v1/publicResolver'
import {
  type EncodeFunctionDataParameters,
  type NamehashErrorType,
  namehash,
} from 'viem'

// ================================
// Clear records parameters
// ================================

export type ClearRecordsParametersErrorType = NamehashErrorType

export const clearRecordsParameters = (name: string) =>
  ({
    abi: publicResolverClearRecordsSnippet,
    functionName: 'clearRecords',
    args: [namehash(name)],
  }) as const satisfies EncodeFunctionDataParameters<
    typeof publicResolverClearRecordsSnippet
  >

export type ClearRecordsParametersReturnType = ReturnType<
  typeof clearRecordsParameters
>
