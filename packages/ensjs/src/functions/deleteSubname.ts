import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity'
import { ENSArgs } from '..'
import { namehash } from '../utils/normalise'

type Args = {
  contract: 'registry' | 'nameWrapper'
}

const deleteWrappedSubname = async (
  {
    contracts,
    signer,
    getWrapperData,
  }: ENSArgs<'contracts' | 'signer' | 'getWrapperData'>,
  name: string,
) => {
  const nameWrapper = (await contracts!.getNameWrapper()!).connect(signer)
  const data = await getWrapperData(name)
  const isPCCBurned = !!data?.parent?.PARENT_CANNOT_CONTROL

  if (isPCCBurned) {
    const node = namehash(name)
    return nameWrapper.populateTransaction.setRecord(
      node,
      '0x0000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000',
      0,
    )
  }

  const labels = name.split('.')
  const label = labels.shift() as string
  const parentNodehash = namehash(labels.join('.'))
  return nameWrapper.populateTransaction.setSubnodeRecord(
    parentNodehash,
    label,
    '0x0000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000000',
    0,
    0,
    0,
  )
}

export default async function (
  {
    contracts,
    signer,
    getWrapperData,
  }: ENSArgs<'contracts' | 'signer' | 'getExpiry' | 'getWrapperData'>,
  name: string,
  { contract }: Args,
) {
  const labels = name.split('.')
  if (labels.length < 3) {
    throw new Error(`${name} is not a valid subname`)
  }

  switch (contract) {
    case 'registry': {
      const registry = (await contracts!.getRegistry()!).connect(signer)
      const label = labels.shift() as string
      const labelhash = solidityKeccak256(['string'], [label])
      const parentNodehash = namehash(labels.join('.'))

      return registry.populateTransaction.setSubnodeRecord(
        parentNodehash,
        labelhash,
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        0,
      )
    }
    case 'nameWrapper': {
      return deleteWrappedSubname({ contracts, signer, getWrapperData }, name)
    }
    default: {
      throw new Error(`Unknown contract: ${contract}`)
    }
  }
}
