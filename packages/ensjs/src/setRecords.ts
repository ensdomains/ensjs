import { formatsByCoinType, formatsByName } from '@ensdomains/address-encoder'
import { ethers } from 'ethers'
import { InternalENS } from '.'
import { encodeContenthash } from './utils/contentHash'

type RecordItem = {
  key: string
  value: string
}

type RecordOptions = {
  contentHash?: string
  texts?: RecordItem[]
  coinTypes?: RecordItem[]
}

export default async function (
  this: InternalENS,
  name: string,
  records: RecordOptions,
) {
  if (!name.includes('.')) {
    throw new Error('Input is not an ENS name')
  }

  const resolverAddress = await this.getResolver(name)

  if (!resolverAddress) {
    throw new Error('No resolver found for input address')
  }

  const address = await this.provider?.getSigner().getAddress()

  if (!address) {
    throw new Error('No signer found')
  }

  const resolver = (
    await this.contracts?.getPublicResolver(this.provider, resolverAddress)
  )?.connect(this.provider?.getSigner()!)
  const namehash = ethers.utils.namehash(name)

  const calls: string[] = []

  if (records.contentHash) {
    const contentHash =
      records.contentHash === '' ? '' : encodeContenthash(records.contentHash)
    const data = resolver?.interface.encodeFunctionData('setContentHash', [
      namehash,
      contentHash,
    ])
    data && calls.push(data)
  }

  if (records.texts && records.texts.length > 0) {
    records.texts.forEach(({ key, value }: RecordItem) => {
      const data = resolver?.interface.encodeFunctionData('setText', [
        namehash,
        key,
        value,
      ])
      data && calls.push(data)
    })
  }

  if (records.coinTypes && records.coinTypes.length > 0) {
    records.coinTypes.forEach(({ key, value }: RecordItem) => {
      let coinTypeInstance
      if (!isNaN(parseInt(key))) {
        coinTypeInstance = formatsByCoinType[parseInt(key)]
      } else {
        coinTypeInstance = formatsByName[key.toUpperCase()]
      }
      const coinType = coinTypeInstance.coinType
      const encodedAddress = coinTypeInstance.decoder(value)
      const data = resolver?.interface.encodeFunctionData(
        'setAddr(bytes32,uint256,bytes)',
        [namehash, coinType, encodedAddress],
      )
      data && calls.push(data)
    })
  }

  return resolver?.multicall(calls)
}
