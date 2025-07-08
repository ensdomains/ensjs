import { type Hex, encodeFunctionData } from 'viem'
import { dedicatedResolverSetAbiSnippet } from '../../contracts/dedicatedResolver.js'
import { publicResolverSetAbiSnippet } from '../../contracts/publicResolver.js'
import type { EncodedAbi } from './encodeAbi.js'

export type EncodeSetAbiParameters = (
  | {
      namehash: Hex
    }
  | {
      namehash?: undefined
    }
) & EncodedAbi

export type EncodeSetAbiReturnType = Hex

export const encodeSetAbi = ({
  namehash,
  contentType,
  encodedData,
}: EncodeSetAbiParameters): EncodeSetAbiReturnType => {
  if (namehash !== undefined) {
    return encodeFunctionData({
      abi: publicResolverSetAbiSnippet,
      functionName: 'setABI',
      args: [namehash, BigInt(contentType), encodedData],
    })
  } else {
    return encodeFunctionData({
      abi: dedicatedResolverSetAbiSnippet,
      functionName: 'setABI',
      args: [BigInt(contentType), encodedData],
    })
  }
}
