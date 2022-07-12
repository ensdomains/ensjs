import { Signer } from 'ethers'
import { ENSArgs } from '..'

export default async function (
  { contracts, provider }: ENSArgs<'contracts' | 'provider'>,
  name: string,
  address?: string,
  resolver?: string,
  options?: { addressOrIndex?: string | number; signer?: Signer },
) {
  const signer = options?.signer || provider?.getSigner(options?.addressOrIndex)

  if (!signer) {
    throw new Error('No signer found')
  }

  const signerAddress = await signer.getAddress()

  const reverseRegistrar = (await contracts?.getReverseRegistrar())?.connect(
    provider?.getSigner()!,
  )

  if (address) {
    const publicResolver = await contracts?.getPublicResolver()

    return reverseRegistrar?.setNameForAddr(
      address,
      signerAddress,
      resolver || publicResolver!.address,
      name,
    )
  }

  return reverseRegistrar?.setName(name)
}
