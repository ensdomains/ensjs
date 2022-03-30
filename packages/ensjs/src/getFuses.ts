import { ethers } from 'ethers'
import { ENSArgs } from '.'
import fuseEnums from './utils/fuses'

const raw = async ({ contracts }: ENSArgs<'contracts'>, name: string) => {
  const nameWrapper = await contracts?.getNameWrapper()!
  return {
    to: nameWrapper.address,
    data: nameWrapper.interface.encodeFunctionData('getFuses(bytes32)', [
      ethers.utils.namehash(name),
    ]),
  }
}

const decode = async ({ contracts }: ENSArgs<'contracts'>, data: string) => {
  const nameWrapper = await contracts?.getNameWrapper()!
  try {
    const [fuses, vulnerability, vulnerableNode] =
      nameWrapper.interface.decodeFunctionResult('getFuses(bytes32)', data)

    const result = Object.fromEntries(
      Object.keys(fuseEnums).map((fuseEnum) => [
        fuseEnum,
        fuses.and(fuseEnums[fuseEnum as keyof typeof fuseEnums]).gt(0),
      ]),
    )

    return result
  } catch {
    return null
  }
}

export default {
  raw,
  decode,
}
