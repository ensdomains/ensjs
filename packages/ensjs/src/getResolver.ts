import { ethers } from 'ethers'
import { ENSArgs } from '.'
import { hexEncodeName } from './utils/hexEncodedName'

export default async function (
  { contracts }: ENSArgs<'contracts'>,
  name: string,
) {
  const universalResolver = await contracts?.getUniversalResolver()
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
