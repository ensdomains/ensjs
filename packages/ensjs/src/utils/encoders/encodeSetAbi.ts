import { type Hex, encodeFunctionData } from 'viem'
import { dedicatedResolverSetAbiSnippet } from '../../contracts/dedicatedResolver.js'
import type { EncodedAbi } from './encodeAbi.js'

export type EncodeSetAbiParameters = EncodedAbi

export type EncodeSetAbiReturnType = Hex

export const encodeSetAbi = ({
  contentType,
  encodedData,
}: EncodeSetAbiParameters): EncodeSetAbiReturnType => {
  return encodeFunctionData({
    abi: dedicatedResolverSetAbiSnippet,
    functionName: 'setABI',
    args: [BigInt(contentType), encodedData],
  })
}
