import { InternalENS } from '.'

type ProfileOptions = {
  contentHash?: boolean
  texts?: boolean | string[]
  coinTypes?: boolean | string[]
}

export default async function (
  this: InternalENS,
  name: string,
  options?: ProfileOptions,
) {
  if (!name.includes('.')) {
    throw new Error('Input is not an ENS name')
  }
  return await this.getProfile(name, options)
}
