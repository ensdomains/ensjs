import { ethers } from 'ethers'
import { ENSArgs } from '.'
import { decodeContenthash } from './utils/contentHash'
import { hexEncodeName } from './utils/hexEncodedName'

export default async function (
  { contracts }: ENSArgs<'contracts'>,
  name: string,
) {
  const universalResolver = await contracts?.getUniversalResolver()
  const publicResolver = await contracts?.getPublicResolver()
  const data = publicResolver?.interface.encodeFunctionData(
    'contenthash(bytes32)',
    [ethers.utils.namehash(name)],
  )
  const result = await universalResolver?.resolve(hexEncodeName(name), data)

  const [encodedContentHash] = ethers.utils.defaultAbiCoder.decode(
    ['bytes'],
    result['0'],
  )

  if (ethers.utils.hexStripZeros(encodedContentHash) === '0x') {
    return null
  }

  return decodeContenthash(encodedContentHash)
}
