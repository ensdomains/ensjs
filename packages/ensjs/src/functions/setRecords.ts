import type { Signer } from 'ethers'
import { ENSArgs } from '..'
import { namehash } from '../utils/normalise'
import { generateRecordCallArray, RecordOptions } from '../utils/recordHelpers'

export default async function (
  {
    contracts,
    provider,
    getResolver,
  }: ENSArgs<'contracts' | 'provider' | 'getResolver'>,
  name: string,
  records: RecordOptions,
  resolverAddress?: string,
  options?: {
    signer?: Signer
    addressOrIndex?: string | number
  },
) {
  if (!name.includes('.')) {
    throw new Error('Input is not an ENS name')
  }

  let resolverToUse: string
  if (resolverAddress) {
    resolverToUse = resolverAddress
  } else {
    resolverToUse = await getResolver(name)
  }

  if (!resolverToUse) {
    throw new Error('No resolver found for input address')
  }

  const signer = options?.signer || provider?.getSigner(options?.addressOrIndex)

  if (!signer) {
    throw new Error('No signer found')
  }

  const resolver = (
    await contracts?.getPublicResolver(provider, resolverToUse)
  )?.connect(signer)
  const hash = namehash(name)

  const calls: string[] = generateRecordCallArray(hash, records, resolver!)

  return resolver?.multicall(calls)
}
