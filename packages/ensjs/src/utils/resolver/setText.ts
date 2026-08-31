import { publicResolverSetTextSnippet } from '@ensdomains/ensjs-abi/v1/publicResolver'
import {
  type EncodeFunctionDataParameters,
  type NamehashErrorType,
  namehash,
} from 'viem'

// ================================
// Set text parameters
// ================================

export type SetTextParameters = {
  /** Name to set text record for (namehash is computed internally) */
  name: string
  key: string
  value: string | null
}

export type SetTextParametersErrorType = NamehashErrorType

export const setTextParameters = ({ name, key, value }: SetTextParameters) => {
  return {
    abi: publicResolverSetTextSnippet,
    functionName: 'setText',
    args: [namehash(name), key, value ?? ''],
  } as const satisfies EncodeFunctionDataParameters<
    typeof publicResolverSetTextSnippet
  >
}

export type SetTextParametersReturnType = ReturnType<typeof setTextParameters>
