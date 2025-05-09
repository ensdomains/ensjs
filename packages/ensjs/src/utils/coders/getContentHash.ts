import { decodeFunctionResult, type Hex } from 'viem'
import { publicResolverContenthashSnippet } from '../../contracts/publicResolver.js'
import type { Prettify } from '../../types.js'
import type { DecodedContentHash } from '../contentHash.js'
import { decodeContentHash } from '../contentHash.js'
import { namehash } from '../name/normalise.js'

export type GetContentHashParameters = {
  /** Name to get content hash record for */
  name: string
  /** Whether or not to throw decoding errors */
  strict?: boolean
}

export type GetContentHashReturnType = Prettify<DecodedContentHash | null>

export type GetContentHashErrorType = Error

export function getContentHashParameters({
  name,
}: Omit<GetContentHashParameters, 'strict'>) {
  return {
    abi: publicResolverContenthashSnippet,
    functionName: 'contenthash',
    args: [namehash(name)],
  } as const
}

export function decodeContentHashResultFromPrimitiveTypes({
  decodedData,
}: {
  decodedData: Hex
}): GetContentHashReturnType {
  return decodeContentHash(decodedData)
}

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
