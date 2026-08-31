import { publicResolverSetContenthashSnippet } from '@ensdomains/ensjs-abi/v1/publicResolver'
import {
  type EncodeFunctionDataParameters,
  type NamehashErrorType,
  namehash,
} from 'viem'
import {
  type EncodeContentHashErrorType,
  encodeContentHash,
} from '../contentHash.js'

// ================================
// Set content hash parameters
// ================================

export type SetContentHashParameters = {
  /** Name to set content hash for (namehash is computed internally) */
  name: string
  contentHash: string | null
}

export type SetContentHashParametersErrorType =
  | EncodeContentHashErrorType
  | NamehashErrorType

export const setContentHashParameters = ({
  name,
  contentHash,
}: SetContentHashParameters) => {
  const encodedHash = contentHash ? encodeContentHash(contentHash) : '0x'
  return {
    abi: publicResolverSetContenthashSnippet,
    functionName: 'setContenthash',
    args: [namehash(name), encodedHash],
  } as const satisfies EncodeFunctionDataParameters<
    typeof publicResolverSetContenthashSnippet
  >
}

export type SetContentHashParametersReturnType = ReturnType<
  typeof setContentHashParameters
>
