import { type EncodeFunctionDataParameters, type Hex } from 'viem'
import { publicResolverSetContenthashSnippet } from '../../contracts/publicResolver.js'
import { encodeContentHash } from '../contentHash.js'

export type SetContentHashParameters = {
  namehash: Hex
  contentHash: string | null
}

export const setContentHashParameters = ({
  namehash,
  contentHash,
}: SetContentHashParameters) => {
  const encodedHash = contentHash ? encodeContentHash(contentHash) : '0x'
  return {
    abi: publicResolverSetContenthashSnippet,
    functionName: 'setContenthash',
    args: [namehash, encodedHash],
  } as const satisfies EncodeFunctionDataParameters<
    typeof publicResolverSetContenthashSnippet
  >
}

export type SetContentHashParametersReturnType = ReturnType<
  typeof setContentHashParameters
>
