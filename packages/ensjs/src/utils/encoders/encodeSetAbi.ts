import { Hex, encodeFunctionData } from 'viem'
import { setAbiSnippet } from '../../contracts/publicResolver'
import { EncodedAbi } from './encodeAbi'

export type EncodeSetAbiParameters = {
  namehash: Hex
} & (EncodedAbi | { contentType: 0; encodedData: null })

type EncodeSetAbiReturnType = Hex

export const encodeSetAbi = ({
  namehash,
  contentType,
  encodedData,
}: EncodeSetAbiParameters): EncodeSetAbiReturnType => {
  return encodeFunctionData({
    abi: setAbiSnippet,
    functionName: 'setABI',
    args: [namehash, BigInt(contentType), encodedData ?? '0x'],
  })
}
