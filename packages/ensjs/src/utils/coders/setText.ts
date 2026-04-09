import type { EncodeFunctionDataParameters, Hex } from 'viem'
import { dedicatedResolverSetTextSnippet } from '@ensdomains/ensjs-abi/dedicatedResolver'
import { publicResolverSetTextSnippet } from '@ensdomains/ensjs-abi/v1/publicResolver'

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
  if (namehash) {
    return {
      abi: publicResolverSetTextSnippet,
      functionName: 'setText',
      args: [namehash, key, value ?? ''],
    } as const satisfies EncodeFunctionDataParameters<
      typeof publicResolverSetTextSnippet
    >
  }
  return {
    abi: dedicatedResolverSetTextSnippet,
    functionName: 'setText',
    args: [key, value ?? ''],
  } as const satisfies EncodeFunctionDataParameters<
    typeof dedicatedResolverSetTextSnippet
  >
}

export type SetTextParametersReturnType = ReturnType<typeof setTextParameters>
