import { publicResolverClearRecordsSnippet } from '@ensdomains/ensjs-abi/v1/publicResolver'
import type { EncodeFunctionDataParameters, Hex } from 'viem'

// ================================
// Clear records parameters
// ================================

export type ClearRecordsParametersErrorType = never

export const clearRecordsParameters = (namehash: Hex) =>
  ({
    abi: publicResolverClearRecordsSnippet,
    functionName: 'clearRecords',
    args: [namehash],
  }) as const satisfies EncodeFunctionDataParameters<
    typeof publicResolverClearRecordsSnippet
  >

export type ClearRecordsParametersReturnType = ReturnType<
  typeof clearRecordsParameters
>
