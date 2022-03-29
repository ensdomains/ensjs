import { formatsByCoinType, formatsByName } from '@ensdomains/address-encoder'
import { ethers } from 'ethers'
import { ENSArgs } from '.'
import { decodeContenthash } from './utils/contentHash'
import { hexEncodeName } from './utils/hexEncodedName'

export async function getContentHash(
  { contracts }: ENSArgs<'contracts'>,
  name: string,
) {
  const universalResolver = await contracts?.getUniversalResolver()
  const publicResolver = await contracts?.getPublicResolver()
  const data = publicResolver?.interface.encodeFunctionData(
    'contenthash(bytes32)',
    [ethers.utils.namehash(name)],
  )
  const result = await universalResolver?.resolve(hexEncodeName(name), data)

  const [encodedContentHash] = ethers.utils.defaultAbiCoder.decode(
    ['bytes'],
    result['0'],
  )

  if (ethers.utils.hexStripZeros(encodedContentHash) === '0x') {
    return null
  }

  return decodeContenthash(encodedContentHash)
}

export async function getText(
  { contracts }: ENSArgs<'contracts'>,
  name: string,
  key: string,
) {
  const universalResolver = await contracts?.getUniversalResolver()
  const publicResolver = await contracts?.getPublicResolver()
  const data = publicResolver?.interface.encodeFunctionData(
    'text(bytes32,string)',
    [ethers.utils.namehash(name), key],
  )
  const result = await universalResolver?.resolve(hexEncodeName(name), data)

  const [decodedText] = ethers.utils.defaultAbiCoder.decode(
    ['string'],
    result['0'],
  )

  if (decodedText === '') {
    return null
  }

  return decodedText
}

export async function getAddr(
  { contracts }: ENSArgs<'contracts'>,
  name: string,
  coinType?: string | number,
) {
  if (!coinType) {
    coinType = 60
  }

  const universalResolver = await contracts?.getUniversalResolver()
  const publicResolver = await contracts?.getPublicResolver()
  const formatter =
    typeof coinType === 'string'
      ? formatsByName[coinType]
      : formatsByCoinType[coinType]

  if (!formatter) {
    throw new Error(`Coin type ${coinType} is not supported`)
  }

  const data = publicResolver?.interface.encodeFunctionData(
    'addr(bytes32,uint256)',
    [ethers.utils.namehash(name), formatter.coinType],
  )
  const result = await universalResolver?.resolve(hexEncodeName(name), data)

  const [encodedAddr] = ethers.utils.defaultAbiCoder.decode(
    ['bytes'],
    result['0'],
  )

  if (ethers.utils.hexStripZeros(encodedAddr) === '0x') {
    return null
  }

  const decodedAddr = formatter.encoder(
    Buffer.from(encodedAddr.slice(2), 'hex'),
  )

  if (!decodedAddr) {
    return null
  }

  return decodedAddr
}
