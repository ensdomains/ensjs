import { Hex, bytesToHex, stringToHex } from 'viem'
import { Prettify } from '../../types'

type AbiEncodeAs = 'json' | 'zlib' | 'cbor' | 'uri'

type AbiContentType = 1 | 2 | 4 | 8

type AbiEncodeMap = {
  json: 1
  zlib: 2
  cbor: 4
  uri: 8
}

type GetAbiContentType<TEncodeAs extends AbiEncodeAs> = AbiEncodeMap[TEncodeAs]

export type EncodeAbiParameters<TEncodeAs extends AbiEncodeAs = AbiEncodeAs> =
  TEncodeAs extends 'uri'
    ? {
        encodeAs: TEncodeAs
        data: string
      }
    : {
        encodeAs: TEncodeAs
        data: Record<any, any>
      }

export type EncodedAbi<TContentType extends AbiContentType = AbiContentType> = {
  contentType: TContentType
  encodedData: Hex
}

export type EncodeAbiReturnType<TContentType extends AbiContentType> =
  EncodedAbi<TContentType>

export const encodeAbi = async <
  TEncodeAs extends AbiEncodeAs,
  TContentType extends GetAbiContentType<TEncodeAs>,
>({
  encodeAs,
  data,
}: EncodeAbiParameters<TEncodeAs>): Promise<
  Prettify<EncodeAbiReturnType<TContentType>>
> => {
  let contentType: AbiContentType
  let encodedData: Hex
  switch (encodeAs) {
    case 'json':
      contentType = 1
      encodedData = stringToHex(JSON.stringify(data))
      break
    case 'zlib': {
      contentType = 2
      const { deflate } = await import('pako/dist/pako_deflate.min.js')
      encodedData = bytesToHex(deflate(JSON.stringify(data)))
      break
    }
    case 'cbor': {
      contentType = 4
      const { encode } = await import('cbor')
      encodedData = bytesToHex(encode(data))
      break
    }
    default: {
      contentType = 8
      encodedData = stringToHex(data as string)
      break
    }
  }
  return { contentType: contentType as TContentType, encodedData }
}
