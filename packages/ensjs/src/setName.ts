import { InternalENS } from '.'

export default async function (this: InternalENS, name: string) {
  const address = await this.provider?.getSigner().getAddress()

  if (!address) {
    throw new Error('No signer found')
  }

  const reverseRegistrar = (
    await this.contracts?.getReverseRegistrar()
  )?.connect(this.provider?.getSigner()!)

  return reverseRegistrar?.setName(name)
}
