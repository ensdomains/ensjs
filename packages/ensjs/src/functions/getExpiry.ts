import { solidityKeccak256 } from 'ethers/lib/utils'
import { ENSArgs } from '..'

const raw = async ({ contracts }: ENSArgs<'contracts'>, name: string) => {
  const baseRegistrar = await contracts?.getBaseRegistrar()!

  const labels = name.split('.')

  if (labels.length > 2 || labels[1] !== 'eth') {
    throw new Error('Only .eth names have expiry dates')
  }

  return {
    to: baseRegistrar.address,
    data: baseRegistrar.interface.encodeFunctionData('nameExpires', [
      solidityKeccak256(['string'], [labels[0]]),
    ]),
  }
}

const decode = async ({ contracts }: ENSArgs<'contracts'>, data: string) => {
  if (data === null) return null
  const baseRegistrar = await contracts?.getBaseRegistrar()!
  try {
    const [result] = baseRegistrar.interface.decodeFunctionResult(
      'nameExpires',
      data,
    )
    return result > 0 ? new Date(result * 1000) : null
  } catch {
    return null
  }
}

export default {
  raw,
  decode,
}
