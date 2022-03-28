import { ethers } from 'ethers'
import { ENSArgs } from '.'
import fuseEnums from './utils/fuses'

export default async function (
  { contracts }: ENSArgs<'contracts'>,
  name: string,
) {
  const nameWrapper = await contracts?.getNameWrapper()
  try {
    const {
      fuses,
      vulnerability,
      vulnerableNode,
    }: { fuses: ethers.BigNumber; vulnerability: any; vulnerableNode: any } =
      await nameWrapper?.getFuses(ethers.utils.namehash(name))

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
