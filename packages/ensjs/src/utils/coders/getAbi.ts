import {
  type DecodeFunctionResultErrorType,
  decodeFunctionResult,
  type Hex,
  type HexToBytesErrorType,
  type HexToStringErrorType,
  hexToBytes,
  hexToString,
  type NamehashErrorType,
  namehash,
  type TrimErrorType,
  trim,
} from 'viem'
import { publicResolverAbiSnippet } from '../../contracts/publicResolver.js'
import type { ErrorType } from '../../errors/utils.js'
import type { DecodedAbi, Prettify } from '../../types/index.js'

/** @deprecated */
export type GetAbiParameters = {
  /** Name to get ABI record for */
  name: string
  /** Supported content types as bitwise
   * ID 1: JSON
   * ID 2: zlib compressed JSON
   * ID 4: CBOR
   * ID 8: URI
   */
  supportedContentTypes?: bigint | undefined
  /** Whether or not to throw decoding errors */
  strict?: boolean | undefined
}

/**
 * @deprecated
 */
export type GetAbiReturnType = Prettify<DecodedAbi | null>

/**
 * @deprecated
 */
export type GetAbiErrorType = Error

// ================================
// Get ABI parameters
// ================================

export type GetAbiParametersParameters = {
  /** Name to get ABI record for */
  name: string
  /** Supported content types as bitwise
   * ID 1: JSON
   * ID 2: zlib compressed JSON
   * ID 4: CBOR
   * ID 8: URI
   */
  supportedContentTypes?: bigint | undefined
}

export type GetAbiParametersReturnType = {
  abi: typeof publicResolverAbiSnippet
  functionName: 'ABI'
  args: readonly [Hex, bigint]
}

export type GetAbiParametersErrorType = NamehashErrorType

export function getAbiParameters({
  name,
  supportedContentTypes = 0xfn,
}: GetAbiParametersParameters): GetAbiParametersReturnType {
  return {
    abi: publicResolverAbiSnippet,
    functionName: 'ABI',
    args: [namehash(name), supportedContentTypes],
  } as const
}

// ================================
// Decode ABI result from primitive types
// ================================

export type DecodeAbiResultFromPrimitiveTypesParameters = {
  decodedData: readonly [bigint, Hex]
}

export type DecodeAbiResultFromPrimitiveTypesReturnType =
  Prettify<DecodedAbi | null>

export type DecodeAbiResultFromPrimitiveTypesErrorType =
  | TrimErrorType
  | HexToStringErrorType
  | HexToBytesErrorType
  | ErrorType

export async function decodeAbiResultFromPrimitiveTypes({
  decodedData: [bigintContentType, encodedAbiData],
}: DecodeAbiResultFromPrimitiveTypesParameters): Promise<DecodeAbiResultFromPrimitiveTypesReturnType> {
  if (!bigintContentType || !encodedAbiData) return null

  const contentType = Number(bigintContentType)
  if (!contentType) return null

  if (
    encodedAbiData === '0x' ||
    encodedAbiData === '0x0' ||
    // may throw TrimErrorType
    trim(encodedAbiData) === '0x00'
  )
    return null

  let abiData: string | object
  let decoded = false
  switch (contentType) {
    // JSON
    case 1:
      // may throw Error
      abiData = JSON.parse(
        // may throw HexToStringErrorType
        hexToString(encodedAbiData),
      )
      decoded = true
      break
    // zlib compressed JSON
    case 2: {
      const { inflate } = await import('pako')
      abiData = JSON.parse(
        // external without error types but may throw Error
        inflate(
          // may throw HexToBytesErrorType
          hexToBytes(encodedAbiData),
          { to: 'string' },
        ),
      )
      decoded = true
      break
    }
    // CBOR
    case 4: {
      const { cborDecode } = await import('@ensdomains/address-encoder/utils')
      // may throw Error
      abiData = await cborDecode(
        // may throw HexToBytesErrorType
        hexToBytes(encodedAbiData).buffer,
      )
      decoded = true
      break
    }
    // URI
    case 8:
      // may throw HexToStringErrorType
      abiData = hexToString(encodedAbiData)
      decoded = true
      break
    default:
      try {
        // may throw HexToStringErrorType
        abiData = hexToString(encodedAbiData)
        decoded = true
      } catch {
        abiData = encodedAbiData
      }
  }

  return {
    contentType,
    decoded,
    abi: abiData,
  }
}

// ================================
// Decode ABI result
// ================================

export type DecodeAbiResultParameters = {
  /** Whether or not to throw decoding errors */
  strict?: boolean | undefined
}

export type DecodeAbiResultReturnType = Prettify<DecodedAbi | null>

export type DecodeAbiResultErrorType = DecodeFunctionResultErrorType
/**
 * Decodes an ABI result from a hex string.
 * @param data - The hex string to decode.
 * @param strict - Whether or not to throw decoding errors.
 * @throws {DecodeAbiResultErrorType}
 * @returns The decoded ABI result.
 */
export async function decodeAbiResult(
  data: Hex,
  { strict }: DecodeAbiResultParameters,
): Promise<DecodeAbiResultReturnType> {
  if (data === '0x') return null

  try {
    // may throw DecodeFunctionResultErrorType
    const decodedData = decodeFunctionResult({
      abi: publicResolverAbiSnippet,
      functionName: 'ABI',
      data,
    })

    return await decodeAbiResultFromPrimitiveTypes({
      decodedData,
    })
  } catch (error) {
    if (strict) throw error
    return null
  }
}
