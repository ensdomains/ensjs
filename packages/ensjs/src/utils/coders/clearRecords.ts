import { type EncodeFunctionDataParameters, type Hex } from 'viem'
import { publicResolverClearRecordsSnippet } from '../../contracts/publicResolver.js'

export const clearRecordsParameters = (namehash: Hex) =>
  ({
    abi: publicResolverClearRecordsSnippet,
    functionName: 'clearRecords',
    args: [namehash],
  } as const satisfies EncodeFunctionDataParameters<
    typeof publicResolverClearRecordsSnippet
  >)

export type ClearRecordsParametersReturnType = ReturnType<
  typeof clearRecordsParameters
>
