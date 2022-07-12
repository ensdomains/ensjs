import { Signer } from 'ethers'
import { ENSArgs } from '..'

export default async function (
  {
    contracts,
    provider,
    transferSubname,
  }: ENSArgs<'contracts' | 'provider' | 'transferSubname'>,
  name: string,
  contract: 'registry' | 'nameWrapper',
  options?: { addressOrIndex?: string | number; signer?: Signer },
) {
  return transferSubname(
    name,
    contract,
    '0x0000000000000000000000000000000000000000',
    options,
  )
}
