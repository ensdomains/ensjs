import {
  type DecodeFunctionResultErrorType,
  decodeFunctionResult,
  type Hex,
  type NamehashErrorType,
  namehash,
} from 'viem'
import { publicResolverTextSnippet } from '../../contracts/publicResolver.js'

/** @deprecated */
export type GetTextParameters = {
  /** Name to get text record for */
  name: string
  /** Text record key to get */
  key: string
  /** Whether or not to throw decoding errors */
  strict?: boolean
}

/** @deprecated */
export type GetTextReturnType = string | null

/** @deprecated */
export type GetTextErrorType = Error

// ================================
// Get text parameters
// ================================

export type GetTextParametersParameters = {
  /** Name to get text record for */
  name: string
  /** Text record key to get */
  key: string
}

export type GetTextParametersReturnType = {
  abi: typeof publicResolverTextSnippet
  functionName: 'text'
  args: readonly [Hex, string]
}

export type GetTextParametersErrorType = NamehashErrorType

export function getTextParameters({ name, key }: GetTextParametersParameters) {
  return {
    abi: publicResolverTextSnippet,
    functionName: 'text',
    args: [namehash(name), key],
  } as const
}

// ================================
// Decode text result from primitive types
// ================================

export type DecodeTextResultFromPrimitiveTypesErrorType = never

export function decodeTextResultFromPrimitiveTypes({
  decodedData,
}: {
  decodedData: string
}): string | null {
  if (decodedData === '') return null
  return decodedData
}

// ================================
// Decode text result
// ================================

export type DecodeTextResultParameters = {
  strict?: boolean
}

export type DecodeTextResultReturnType = string | null

export type DecodeTextResultErrorType =
  | DecodeFunctionResultErrorType
  | DecodeTextResultFromPrimitiveTypesErrorType

export function decodeTextResult(
  data: Hex,
  {
    strict,
  }: {
    strict?: boolean
  },
): DecodeTextResultReturnType {
  if (data === '0x') return null

  try {
    const decodedData = decodeFunctionResult({
      abi: publicResolverTextSnippet,
      functionName: 'text',
      data,
    })

    return decodeTextResultFromPrimitiveTypes({ decodedData })
  } catch (error) {
    if (strict) throw error
    return null
  }
}
