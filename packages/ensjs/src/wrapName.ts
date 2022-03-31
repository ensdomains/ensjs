import { ethers } from 'ethers'
import { ENSArgs } from '.'
import fuses from './utils/fuses'
import { hexEncodeName } from './utils/hexEncodedName'

type FuseOptions = {
  cannotUnwrap: true
  cannotBurnFuses?: boolean
  cannotTransfer?: boolean
  cannotSetResolver?: boolean
  cannotSetTtl?: boolean
  cannotCreateSubdomain?: boolean
  cannotReplaceSubdomain?: boolean
}

async function wrapETH(
  { contracts }: ENSArgs<'contracts'>,
  labels: string[],
  wrappedOwner: string,
  decodedFuses: string,
  resolverAddress: string,
  signer: ethers.Signer,
  address: string,
) {
  const nameWrapper = await contracts?.getNameWrapper()!
  const baseRegistrar = (await contracts?.getBaseRegistrar()!).connect(signer)

  const labelhash = ethers.utils.solidityKeccak256(['string'], [labels[0]])

  const data = ethers.utils.defaultAbiCoder.encode(
    ['string', 'address', 'uint96', 'address'],
    [labels[0], wrappedOwner, decodedFuses, resolverAddress],
  )

  return baseRegistrar['safeTransferFrom(address,address,uint256,bytes)'](
    address,
    nameWrapper.address,
    labelhash,
    data,
  )
}

async function wrapOther(
  { contracts }: ENSArgs<'contracts'>,
  name: string,
  wrappedOwner: string,
  decodedFuses: string,
  resolverAddress: string,
  address: string,
) {
  const nameWrapper = await contracts?.getNameWrapper()!
  const registry = await contracts?.getRegistry()!

  const hasApproval = await registry.isApprovedForAll(
    address,
    nameWrapper.address,
  )

  if (!hasApproval) {
    throw new Error(
      'NameWrapper must have approval to wrap a name from this address.',
    )
  }

  return nameWrapper.wrap(
    hexEncodeName(name),
    wrappedOwner,
    decodedFuses,
    resolverAddress,
  )
}

export default async function (
  { contracts, provider }: ENSArgs<'contracts' | 'provider'>,
  name: string,
  wrappedOwner: string,
  fuseOptions?: FuseOptions | string | number,
  resolverAddress?: string,
  options?: { addressOrIndex?: string | number },
) {
  const signer = provider?.getSigner(options?.addressOrIndex)

  const address = await signer?.getAddress()

  if (!signer || !address) {
    throw new Error('No signer found')
  }

  let decodedFuses: string

  switch (typeof fuseOptions) {
    case 'object': {
      const fuseKeys = Object.keys(fuseOptions)
        .filter((opt) => fuseOptions[opt as keyof FuseOptions] === true)
        .map((opt) =>
          opt
            .split(/(?=[A-Z])/)
            .join('_')
            .toUpperCase(),
        )
      const bigNumberFuses = fuseKeys.reduce((prev, curr) => {
        console.log(curr)
        return prev.or(fuses[curr as keyof typeof fuses])
      }, ethers.BigNumber.from(0))
      decodedFuses = bigNumberFuses.toHexString()
      break
    }
    case 'number': {
      decodedFuses = fuseOptions.toString(16)
      break
    }
    case 'string': {
      decodedFuses = fuseOptions
      break
    }
    case 'undefined': {
      decodedFuses = '0'
      break
    }
    default: {
      throw new Error(`Invalid fuseOptions type: ${typeof fuseOptions}`)
    }
  }

  const publicResolver = await contracts?.getPublicResolver()!
  if (!resolverAddress) resolverAddress = publicResolver.address

  const labels = name.split('.')
  if (labels.length < 3 && labels[labels.length - 1] === 'eth') {
    return wrapETH(
      { contracts },
      labels,
      wrappedOwner,
      decodedFuses,
      resolverAddress,
      signer,
      address,
    )
  } else {
    return wrapOther(
      { contracts },
      name,
      wrappedOwner,
      decodedFuses,
      resolverAddress,
      address,
    )
  }
}
