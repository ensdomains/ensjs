import { encodeFunctionData, type Hex } from 'viem'
import { publicResolverSetContenthashSnippet } from '../../contracts/publicResolver.js'
import { encodeContenthash } from '../contentHash.js'

export type EncodeSetContentHashParameters = {
  namehash: Hex
  contentHash: string | null
}

export type EncodeSetContentHashReturnType = Hex

export const encodeSetContentHash = ({
  namehash,
  contentHash,
}: EncodeSetContentHashParameters): EncodeSetContentHashReturnType => {
  let encodedHash: Hex = '0x'
  if (contentHash) {
    const encodedObject = encodeContenthash(contentHash)
    if (encodedObject.error) throw new Error(encodedObject.error)
    if (!encodedObject.encoded) throw new Error('Failed to encocde contentHash')
    encodedHash = encodedObject.encoded as Hex
  }
  return encodeFunctionData({
    abi: publicResolverSetContenthashSnippet,
    functionName: 'setContenthash',
    args: [namehash, encodedHash],
  })
}
