import { ethers } from 'ethers'
import { ENSArgs } from '.'

export default async function (
  { contracts }: ENSArgs<'contracts'>,
  name: string,
) {
  const baseRegistrar = await contracts?.getBaseRegistrar()
  const nameWrapper = await contracts?.getNameWrapper()
  const labels = name.split('.')
  let response

  if (labels.length > 2) {
    response = await nameWrapper?.ownerOf(ethers.utils.namehash(name))
  } else {
    response = await baseRegistrar?.ownerOf(
      ethers.utils.solidityKeccak256(['string'], [labels[0]]),
    )
  }

  if (
    !response ||
    !response[0] ||
    ethers.utils.hexStripZeros(response) === '0x'
  ) {
    return null
  }
  return response
}
