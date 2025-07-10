import {
  type DecodeFunctionResultErrorType,
  decodeFunctionResult,
  type Hex,
  type NamehashErrorType,
  namehash,
} from 'viem'
import { publicResolverContenthashSnippet } from '../../contracts/publicResolver.js'
import type { Prettify } from '../../types/index.js'
import type {
  DecodeContentHashErrorType,
  DecodedContentHash,
} from '../contentHash.js'
import { decodeContentHash } from '../contentHash.js'

// ================================
// Get content hash parameters
// ================================

export type GetContentHashParameters = {
  /** Name to get content hash record for */
  name: string
  /** Whether or not to throw decoding errors */
  strict?: boolean
}

export type GetContentHashReturnType = Prettify<DecodedContentHash | null>

export type GetContentHashErrorType = NamehashErrorType

export function getContentHashParameters({
  name,
}: Omit<GetContentHashParameters, 'strict'>) {
  return {
    abi: publicResolverContenthashSnippet,
    functionName: 'contenthash',
    args: [namehash(name)],
  } as const
}

// ================================
// Decode content hash result from primitive types
// ================================
export type DecodeContentHashResultFromPrimitiveTypesErrorType =
  DecodeContentHashErrorType

export function decodeContentHashResultFromPrimitiveTypes({
  decodedData,
}: {
  decodedData: Hex
}): GetContentHashReturnType {
  return decodeContentHash(decodedData)
}

// ================================
// Decode content hash result
// ================================

export type DecodeContentHashResultErrorType =
  | DecodeFunctionResultErrorType
  | DecodeContentHashResultFromPrimitiveTypesErrorType

export function decodeContentHashResult(
  data: Hex,
  { strict }: Pick<GetContentHashParameters, 'strict'>,
): GetContentHashReturnType {
  if (data === '0x') return null

  try {
    const decodedData = decodeFunctionResult({
      abi: publicResolverContenthashSnippet,
      functionName: 'contenthash',
      data,
    })

    return decodeContentHashResultFromPrimitiveTypes({ decodedData })
  } catch (error) {
    if (strict) throw error
    return null
  }
}
