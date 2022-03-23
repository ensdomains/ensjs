import { ethers } from 'ethers'
import { InternalENS } from '.'
import { hexEncodeName } from './utils/hexEncodedName'

export default async function (this: InternalENS, name: string) {
  const universalResolver = await this.contracts?.getUniversalResolver()
  const response = await universalResolver?.findResolver(hexEncodeName(name))

  if (
    !response ||
    !response[0] ||
    ethers.utils.hexStripZeros(response[0]) === '0x'
  ) {
    return null
  }
  return response[0]
}
