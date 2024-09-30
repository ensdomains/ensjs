import { bytesToHex, stringToHex, type Hex } from 'viem'
import { UnknownContentTypeError } from '../../errors/utils.js'
import type { Prettify } from '../../types.js'

export type AbiEncodeAs = 'json' | 'zlib' | 'cbor' | 'uri'

type AbiContentType = 1 | 2 | 4 | 8

const abiEncodeMap = {
  json: 1,
  zlib: 2,
  cbor: 4,
  uri: 8,
} as const
type AbiEncodeMap = typeof abiEncodeMap

type GetAbiContentType<encodeAs extends AbiEncodeAs> = AbiEncodeMap[encodeAs]

export type EncodeAbiParameters<encodeAs extends AbiEncodeAs = AbiEncodeAs> =
  encodeAs extends 'uri'
    ? {
        encodeAs: encodeAs
        data: string | null
      }
    : {
        encodeAs: encodeAs
        data: Record<any, any> | null
      }

export type EncodedAbi<contentType extends AbiContentType = AbiContentType> = {
  contentType: contentType
  encodedData: Hex
}

export type EncodeAbiReturnType<contentType extends AbiContentType> =
  EncodedAbi<contentType>

export const contentTypeToEncodeAs = (
  contentType: AbiContentType,
): AbiEncodeAs => {
  switch (contentType) {
    case 1:
      return 'json'
    case 2:
      return 'zlib'
    case 4:
      return 'cbor'
    case 8:
      return 'uri'
    default:
      throw new UnknownContentTypeError({ contentType })
  }
}

export const encodeAsToContentType = (
  encodeAs: AbiEncodeAs,
): AbiContentType => {
  const contentType = abiEncodeMap[encodeAs]
  if (contentType === undefined) {
    throw new UnknownContentTypeError({ contentType: encodeAs })
  }
  return contentType
}

export const encodeAbi = async <
  encodeAs extends AbiEncodeAs,
  contentType extends GetAbiContentType<encodeAs>,
>({
  encodeAs,
  data,
}: EncodeAbiParameters<encodeAs>): Promise<
  Prettify<EncodeAbiReturnType<contentType>>
> => {
  let contentType: AbiContentType
  let encodedData: Hex = '0x'
  switch (encodeAs) {
    case 'json':
      contentType = 1
      if (data) encodedData = stringToHex(JSON.stringify(data))
      break
    case 'zlib': {
      contentType = 2
      if (data) {
        const { deflate } = await import('pako/dist/pako_deflate.min.js')
        encodedData = bytesToHex(deflate(JSON.stringify(data)))
      }
      break
    }
    case 'cbor': {
      contentType = 4
      if (data) {
        const { cborEncode } = await import('@ensdomains/address-encoder/utils')
        encodedData = bytesToHex(new Uint8Array(cborEncode(data)))
      }
      break
    }
    default: {
      contentType = 8
      if (data) encodedData = stringToHex(data as string)
      break
    }
  }
  return { contentType: contentType as contentType, encodedData }
}
