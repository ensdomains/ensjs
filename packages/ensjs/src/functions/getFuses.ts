import { BigNumber } from 'ethers'
import { ENSArgs } from '..'
import { testable as fuseEnums } from '../utils/fuses'
import { namehash } from '../utils/normalise'

const NameSafety = [
  'Safe',
  'RegistrantNotWrapped',
  'ControllerNotWrapped',
  'SubdomainReplacementAllowed',
  'Expired',
]

const raw = async ({ contracts }: ENSArgs<'contracts'>, name: string) => {
  const nameWrapper = await contracts?.getNameWrapper()!
  return {
    to: nameWrapper.address,
    data: nameWrapper.interface.encodeFunctionData('getFuses', [
      namehash(name),
    ]),
  }
}

const decode = async (
  { contracts }: ENSArgs<'contracts'>,
  data: string,
  name: string,
) => {
  const nameWrapper = await contracts?.getNameWrapper()!
  try {
    const [_fuses, expiry] = nameWrapper.interface.decodeFunctionResult(
      'getFuses',
      data,
    )

    const fuses = BigNumber.from(_fuses)

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

    const expiryDate = new Date(expiry * 1000)

    return {
      fuseObj,
      expiryDate,
      rawFuses: fuses,
    }
  } catch {
    return
  }
}

export default {
  raw,
  decode,
}
