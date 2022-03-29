import { ethers } from 'ethers'
import { ENSArgs } from '.'

export async function setResolver(
  { contracts, provider }: ENSArgs<'contracts' | 'provider'>,
  name: string,
  contract: 'registry' | 'nameWrapper',
  resolver?: string,
  options?: { addressOrIndex?: string | number },
) {
  const address = await provider
    ?.getSigner(options?.addressOrIndex)
    .getAddress()

  if (!address) {
    throw new Error('No signer found')
  }

  if (!resolver) {
    resolver = (await contracts?.getPublicResolver()!).address
  }

  switch (contract) {
    case 'registry': {
      const registry = (await contracts?.getRegistry())!.connect(
        provider?.getSigner(options?.addressOrIndex)!,
      )
      return registry.setResolver(ethers.utils.namehash(name), resolver)
    }
    case 'nameWrapper': {
      const nameWrapper = (await contracts?.getNameWrapper())!.connect(
        provider?.getSigner(options?.addressOrIndex)!,
      )
      return nameWrapper.setResolver(ethers.utils.namehash(name), resolver)
    }
    default: {
      throw new Error(`Unknown contract: ${contract}`)
    }
  }
}

export async function transfer(
  { contracts, provider }: ENSArgs<'contracts' | 'provider'>,
  name: string,
  newOwner: string,
  contract: 'registry' | 'nameWrapper' | 'baseRegistrar',
  options?: { addressOrIndex?: string | number },
) {
  const address = await provider
    ?.getSigner(options?.addressOrIndex)
    .getAddress()

  if (!address) {
    throw new Error('No signer found')
  }

  switch (contract) {
    case 'registry': {
      const registry = (await contracts?.getRegistry())!.connect(
        provider?.getSigner(options?.addressOrIndex)!,
      )
      return registry.setOwner(ethers.utils.namehash(name), newOwner)
    }
    case 'baseRegistrar': {
      const baseRegistrar = (await contracts?.getBaseRegistrar())!.connect(
        provider?.getSigner(options?.addressOrIndex)!,
      )
      const labels = name.split('.')
      if (labels.length > 2 || labels[labels.length - 1] !== 'eth') {
        throw new Error('Invalid name for baseRegistrar')
      }
      return baseRegistrar.safeTransferFrom(
        address,
        newOwner,
        ethers.utils.solidityKeccak256(['string'], [labels[0]]),
      )
    }
    case 'nameWrapper': {
      const nameWrapper = (await contracts?.getNameWrapper())!.connect(
        provider?.getSigner(options?.addressOrIndex)!,
      )
      return nameWrapper.safeTransferFrom(
        address,
        newOwner,
        ethers.utils.namehash(name),
        1,
        '0x',
      )
    }
    default: {
      throw new Error(`Unknown contract: ${contract}`)
    }
  }
}
