import { Hex, encodeFunctionData } from 'viem'
import { setContenthashSnippet } from '../../contracts/publicResolver'
import { encodeContenthash } from '../contentHash'

export type EncodeSetContentHashParameters = {
  namehash: Hex
  contentHash: string | null
}

type EncodeSetContentHashReturnType = Hex

export const encodeSetContentHash = ({
  namehash,
  contentHash,
}: EncodeSetContentHashParameters): EncodeSetContentHashReturnType => {
  let encodedHash: Hex = '0x'
  if (contentHash) {
    const encodedObject = encodeContenthash(contentHash)
    if (encodedObject.error) throw new Error(encodedObject.error)
    encodedHash = encodedObject.encoded as Hex
  }
  return encodeFunctionData({
    abi: setContenthashSnippet,
    functionName: 'setContenthash',
    args: [namehash, encodedHash],
  })
}
