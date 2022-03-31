import { ethers } from 'ethers'
import { ENSArgs } from '.'
import { FuseOptions } from './@types/FuseOptions'
import generateFuseInput from './utils/generateFuseInput'

export default async function (
  { contracts, provider }: ENSArgs<'contracts' | 'provider'>,
  name: string,
  owner: string,
  contract: 'registry' | 'nameWrapper',
  resolverAddress?: string,
  fuses?: FuseOptions,
  options?: { addressOrIndex?: string | number },
) {
  const signer = provider?.getSigner(options?.addressOrIndex)

  if (!signer) {
    throw new Error('No signer found')
  }

  const labels = name.split('.')

  if (labels.length === 1) {
    throw new Error(
      'Subnames in ENS.js can only be created for other subnames, not TLDs',
    )
  }

  if (fuses && contract === 'registry') {
    throw new Error('Fuses can only be set on a wrapped name')
  }

  const labelhash = ethers.utils.solidityKeccak256(['string'], [labels.shift()])
  const parentNodehash = ethers.utils.namehash(labels.join('.'))

  switch (contract) {
    case 'registry': {
      const registry = (await contracts?.getRegistry()!).connect(signer)

      return registry.setSubnodeRecord(
        parentNodehash,
        labelhash,
        owner,
        resolverAddress,
        0,
      )
    }
    case 'nameWrapper': {
      const nameWrapper = (await contracts?.getNameWrapper()!).connect(signer)

      const generatedFuses = fuses ? generateFuseInput(fuses) : '0'

      return nameWrapper.setSubnodeRecordAndWrap(
        parentNodehash,
        labelhash,
        owner,
        resolverAddress,
        0,
        generatedFuses,
      )
    }
    default: {
      throw new Error(`Unknown contract: ${contract}`)
    }
  }
}
