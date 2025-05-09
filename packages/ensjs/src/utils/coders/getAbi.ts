import {
  decodeFunctionResult,
  hexToBytes,
  hexToString,
  trim,
  type Hex,
} from 'viem'
import { publicResolverAbiSnippet } from '../../contracts/publicResolver.js'
import type { DecodedAbi, Prettify } from '../../types.js'
import { namehash } from '../name/normalise.js'

export type GetAbiParameters = {
  /** Name to get ABI record for */
  name: string
  /** Supported content types as bitwise
   * ID 1: JSON
   * ID 2: zlib compressed JSON
   * ID 4: CBOR
   * ID 8: URI
   */
  supportedContentTypes?: bigint
  /** Whether or not to throw decoding errors */
  strict?: boolean
}

export type GetAbiReturnType = Prettify<DecodedAbi | null>

export type GetAbiErrorType = Error

export function getAbiParameters({
  name,
  supportedContentTypes = 0xfn,
}: Omit<GetAbiParameters, 'strict'>) {
  return {
    abi: publicResolverAbiSnippet,
    functionName: 'ABI',
    args: [namehash(name), supportedContentTypes],
  } as const
}

export async function decodeAbiResultFromPrimitiveTypes({
  decodedData: [bigintContentType, encodedAbiData],
}: {
  decodedData: readonly [bigint, Hex]
}): Promise<GetAbiReturnType> {
  if (!bigintContentType || !encodedAbiData) return null

  const contentType = Number(bigintContentType)
  if (!contentType) return null

  if (
    encodedAbiData === '0x' ||
    encodedAbiData === '0x0' ||
    trim(encodedAbiData) === '0x00'
  )
    return null

  let abiData: string | object
  let decoded = false
  switch (contentType) {
    // JSON
    case 1:
      abiData = JSON.parse(hexToString(encodedAbiData))
      decoded = true
      break
    // zlib compressed JSON
    case 2: {
      const { inflate } = await import('pako/dist/pako_inflate.min.js')
      abiData = JSON.parse(
        inflate(hexToBytes(encodedAbiData), { to: 'string' }),
      )
      decoded = true
      break
    }
    // CBOR
    case 4: {
      const { cborDecode } = await import('@ensdomains/address-encoder/utils')
      abiData = await cborDecode(hexToBytes(encodedAbiData).buffer)
      decoded = true
      break
    }
    // URI
    case 8:
      abiData = hexToString(encodedAbiData)
      decoded = true
      break
    default:
      try {
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

export async function decodeAbiResult(
  data: Hex,
  { strict }: Pick<GetAbiParameters, 'strict'>,
): Promise<GetAbiReturnType> {
  if (data === '0x') return null

  try {
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
