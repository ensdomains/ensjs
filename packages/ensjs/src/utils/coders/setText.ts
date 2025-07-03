import type { EncodeFunctionDataParameters, Hex } from 'viem'
import { dedicatedResolverSetTextSnippet } from '../../contracts/dedicatedResolver.js'
import { publicResolverSetTextSnippet } from '../../contracts/publicResolver.js'

// ================================
// Set text parameters
// ================================

export type SetTextParameters = {
  namehash?: Hex
  key: string
  value: string | null
}

export type SetTextParametersErrorType = never

export const setTextParameters = ({
  namehash,
  key,
  value,
}: SetTextParameters) => {
  if (!namehash) {
    return {
      abi: dedicatedResolverSetTextSnippet,
      functionName: 'setText',
      args: [key, value ?? ''],
    } as const satisfies EncodeFunctionDataParameters<
      typeof dedicatedResolverSetTextSnippet
    >
  } else {
    return {
      abi: publicResolverSetTextSnippet,
      functionName: 'setText',
      args: [namehash, key, value ?? ''],
    } as const satisfies EncodeFunctionDataParameters<
      typeof publicResolverSetTextSnippet
    >
  }
}

export type SetTextParametersReturnType = ReturnType<typeof setTextParameters>
