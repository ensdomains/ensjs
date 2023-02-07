import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity'
import { ENSArgs } from '..'
import { namehash } from '../utils/normalise'
import { makeResolver } from '../utils/registry'
import { expiryToBigNumber, Expiry } from '../utils/wrapper'

type BaseArgs = {
  owner: string
  resolverAddress?: string
  contract: 'registry' | 'nameWrapper'
}

type NameWrapperArgs = {
  contract: 'nameWrapper'
  expiry?: Expiry
} & BaseArgs

type Args = BaseArgs | NameWrapperArgs

const transferWrappedSubname = async (
  {
    contracts,
    signer,
    getWrapperData,
  }: ENSArgs<'contracts' | 'signer' | 'getWrapperData' | 'getExpiry'>,
  name: string,
  { contract, owner, resolverAddress, ...wrapperArgs }: NameWrapperArgs,
) => {
  const nameWrapper = (await contracts!.getNameWrapper()!).connect(signer)
  const data = await getWrapperData(name)
  const senderAddress = await signer.getAddress()

  if (senderAddress === data?.owner) {
    const node = namehash(name)
    const resolver = await makeResolver({ contracts }, name, resolverAddress)
    return nameWrapper.populateTransaction.setRecord(node, owner, resolver, 0)
  }

  const labels = name.split('.')
  const label = labels.shift() as string
  const parentNodehash = namehash(labels.join('.'))
  const expiry = expiryToBigNumber(wrapperArgs.expiry, 0)

  return nameWrapper.populateTransaction.setSubnodeOwner(
    parentNodehash,
    label,
    owner,
    '0',
    expiry,
  )
}

export default async function (
  {
    contracts,
    signer,
    getExpiry,
    getWrapperData,
  }: ENSArgs<'contracts' | 'signer' | 'getExpiry' | 'getWrapperData'>,
  name: string,
  { contract, owner, resolverAddress, ...wrapperArgs }: Args,
) {
  const labels = name.split('.')
  const label = labels.shift() as string
  const labelhash = solidityKeccak256(['string'], [label])
  const parentNodehash = namehash(labels.join('.'))

  switch (contract) {
    case 'registry': {
      const registry = (await contracts!.getRegistry()!).connect(signer)

      return registry.populateTransaction.setSubnodeOwner(
        parentNodehash,
        labelhash,
        owner,
      )
    }
    case 'nameWrapper': {
      return transferWrappedSubname(
        { contracts, signer, getWrapperData, getExpiry },
        name,
        {
          contract,
          owner,
          resolverAddress,
          ...wrapperArgs,
        },
      )
    }
    default: {
      throw new Error(`Unknown contract: ${contract}`)
    }
  }
}
