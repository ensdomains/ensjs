import { ethers } from 'ethers'
import { ENSArgs } from '.'

export default async function (
  { contracts, provider }: ENSArgs<'contracts' | 'provider'>,
  name: string,
  resolver?: string,
) {
  const address = await provider?.getSigner().getAddress()

  if (!address) {
    throw new Error('No signer found')
  }

  const registry = (await contracts?.getRegistry())!.connect(
    provider?.getSigner()!,
  )

  if (!resolver) {
    resolver = (await contracts?.getPublicResolver()!).address
  }

  return registry.setResolver(ethers.utils.namehash(name), resolver)
}
