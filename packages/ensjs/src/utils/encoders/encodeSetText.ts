import { Hex, encodeFunctionData } from 'viem'
import { setTextSnippet } from '../../contracts/publicResolver'

export type EncodeSetTextParameters = {
  namehash: Hex
  key: string
  value: string | null
}

type EncodeSetTextReturnType = Hex

export const encodeSetText = ({
  namehash,
  key,
  value,
}: EncodeSetTextParameters): EncodeSetTextReturnType => {
  return encodeFunctionData({
    abi: setTextSnippet,
    functionName: 'setText',
    args: [namehash, key, value ?? ''],
  })
}
