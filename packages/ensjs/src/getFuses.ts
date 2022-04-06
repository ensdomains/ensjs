import { BigNumber, ethers } from 'ethers'
import { ENSArgs } from '.'
import { testable as fuseEnums } from './utils/fuses'

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

    const fuseObj = Object.fromEntries(
      Object.keys(fuseEnums).map((fuseEnum) => [
        fuseEnum
          .toLowerCase()
          .replace(/([-_][a-z])/g, (group: string) =>
            group.toUpperCase().replace('-', '').replace('_', ''),
          ),
        fuses.and(fuseEnums[fuseEnum as keyof typeof fuseEnums]).gt(0),
      ]),
    )

    if (fuses.eq(0)) {
      fuseObj.canDoEverything = true
    } else {
      fuseObj.canDoEverything = false
    }

    return {
      fuseObj,
      vulnerability,
      vulnerableNode,
      rawFuses: fuses as BigNumber,
    }
  } catch {
    return null
  }
}

export default {
  raw,
  decode,
}
