import { hexStripZeros } from '@ethersproject/bytes'
import { ENSArgs } from '..'
import { hexDecodeName } from '../utils/hexEncodedName'
import { namehash } from '../utils/normalise'

const raw = async ({ contracts }: ENSArgs<'contracts'>, name: string) => {
  const nameWrapper = await contracts?.getNameWrapper()!

  return {
    to: nameWrapper.address,
    data: nameWrapper.interface.encodeFunctionData('names', [namehash(name)]),
  }
}

const decode = async ({ contracts }: ENSArgs<'contracts'>, data: string) => {
  if (data === null) return
  const nameWrapper = await contracts?.getNameWrapper()!
  try {
    const result = nameWrapper.interface.decodeFunctionResult('names', data)
    if (hexStripZeros(result['0']) === '0x') return
    const decoded = hexDecodeName(result['0'])
    return decoded
  } catch (e: any) {
    console.error('Error decoding name: ', e)
    return
  }
}

export default {
  raw,
  decode,
}
