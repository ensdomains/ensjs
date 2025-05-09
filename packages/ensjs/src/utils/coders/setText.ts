import { type EncodeFunctionDataParameters, type Hex } from 'viem'
import { publicResolverSetTextSnippet } from '../../contracts/publicResolver.js'

export type SetTextParameters = {
  namehash: Hex
  key: string
  value: string | null
}

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
