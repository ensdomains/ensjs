import type { EncodeFunctionDataParameters, Hex } from 'viem'
import { dedicatedResolverSetContentHashSnippet } from '../../contracts/dedicatedResolver.js'
import { publicResolverSetContenthashSnippet } from '../../contracts/publicResolver.js'
import {
  type EncodeContentHashErrorType,
  encodeContentHash,
} from '../contentHash.js'

// ================================
// Set content hash parameters
// ================================

export type SetContentHashParameters = {
  namehash?: Hex
  contentHash: string | null
}

export type SetContentHashParametersErrorType = EncodeContentHashErrorType

export const setContentHashParameters = ({
  namehash,
  contentHash,
}: SetContentHashParameters) => {
  const encodedHash = contentHash ? encodeContentHash(contentHash) : '0x'
  if (namehash) {
    return {
      abi: publicResolverSetContenthashSnippet,
      functionName: 'setContenthash',
      args: [namehash, encodedHash],
    } as const satisfies EncodeFunctionDataParameters<
      typeof publicResolverSetContenthashSnippet
    >
  }
  return {
    abi: dedicatedResolverSetContentHashSnippet,
    functionName: 'setContenthash',
    args: [encodedHash],
  } as const satisfies EncodeFunctionDataParameters<
    typeof dedicatedResolverSetContentHashSnippet
  >
}

export type SetContentHashParametersReturnType = ReturnType<
  typeof setContentHashParameters
>
