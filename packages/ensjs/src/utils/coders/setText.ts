import { publicResolverSetTextSnippet } from '@ensdomains/ensjs-abi/v1/publicResolver'
import type { EncodeFunctionDataParameters, Hex } from 'viem'

// ================================
// Set text parameters
// ================================

export type SetTextParameters = {
  namehash: Hex
  key: string
  value: string | null
}

export type SetTextParametersErrorType = never

export const setTextParameters = ({
  namehash,
  key,
  value,
}: SetTextParameters) => {
  return {
    abi: publicResolverSetTextSnippet,
    functionName: 'setText',
    args: [namehash, key, value ?? ''],
  } as const satisfies EncodeFunctionDataParameters<
    typeof publicResolverSetTextSnippet
  >
}

export type SetTextParametersReturnType = ReturnType<typeof setTextParameters>
