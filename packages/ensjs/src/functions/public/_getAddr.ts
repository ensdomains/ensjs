import { formatsByCoinType, formatsByName } from '@ensdomains/address-encoder'
import { decodeFunctionResult, encodeFunctionData, trim, type Hex } from 'viem'
import { namehash } from '../../utils/normalise.js'

import type { ClientWithEns } from '../../contracts/consts.js'
import {
  publicResolverMultiAddrSnippet,
  publicResolverSingleAddrSnippet,
} from '../../contracts/publicResolver.js'
import { CoinFormatterNotFoundError } from '../../errors/public.js'
import type {
  DecodedAddr,
  Prettify,
  SimpleTransactionRequest,
} from '../../types.js'
import { EMPTY_ADDRESS } from '../../utils/consts.js'
import { generateFunction } from '../../utils/generateFunction.js'
import { normaliseCoinId } from '../../utils/normaliseCoinId.js'

export type InternalGetAddrParameters = {
  /** Name to get the address record for */
  name: string
  /** Coin to get the address record for, can be either symbol (string) or coinId (number) (default: `60`) */
  coin?: string | number
  /** Optionally return raw bytes value of address record (default: false) */
  bypassFormat?: boolean
}

export type InternalGetAddrReturnType = Prettify<DecodedAddr | null>

const encode = (
  _client: ClientWithEns,
  { name, coin = 60, bypassFormat }: InternalGetAddrParameters,
): SimpleTransactionRequest => {
  const normalisedCoin = normaliseCoinId(coin)
  if (
    (normalisedCoin.type === 'id' && normalisedCoin.value === 60) ||
    (normalisedCoin.type === 'name' && normalisedCoin.value === 'ETH')
  ) {
    return {
      to: EMPTY_ADDRESS,
      data: encodeFunctionData({
        abi: publicResolverSingleAddrSnippet,
        functionName: 'addr',
        args: [namehash(name)],
      }),
    }
  }

  if (bypassFormat) {
    return {
      to: EMPTY_ADDRESS,
      data: encodeFunctionData({
        abi: publicResolverMultiAddrSnippet,
        functionName: 'addr',
        args: [namehash(name), BigInt(coin)],
      }),
    }
  }
  const formatter =
    normalisedCoin.type === 'name'
      ? formatsByName[normalisedCoin.value]
      : formatsByCoinType[normalisedCoin.value]

  if (!formatter)
    throw new CoinFormatterNotFoundError({ coinType: normalisedCoin.value })

  return {
    to: EMPTY_ADDRESS,
    data: encodeFunctionData({
      abi: publicResolverMultiAddrSnippet,
      functionName: 'addr',
      args: [namehash(name), BigInt(formatter.coinType)],
    }),
  }
}

const decode = async (
  _client: ClientWithEns,
  data: Hex,
  { coin = 60 }: InternalGetAddrParameters,
): Promise<InternalGetAddrReturnType> => {
  if (data === '0x') return null

  const normalisedCoin = normaliseCoinId(coin)

  const formatter =
    normalisedCoin.type === 'name'
      ? formatsByName[normalisedCoin.value]
      : formatsByCoinType[normalisedCoin.value]

  let response: Hex

  if (
    (normalisedCoin.type === 'id' && normalisedCoin.value === 60) ||
    (normalisedCoin.type === 'name' && normalisedCoin.value === 'ETH')
  ) {
    response = decodeFunctionResult({
      abi: publicResolverSingleAddrSnippet,
      functionName: 'addr',
      data,
    })
  } else {
    response = decodeFunctionResult({
      abi: publicResolverMultiAddrSnippet,
      functionName: 'addr',
      data,
    })
  }

  if (!response) return null

  const trimmed = trim(response)
  if (trimmed === '0x' || trimmed === '0x0' || trimmed === '0x00') {
    return null
  }

  const decodedAddr = formatter.encoder(Buffer.from(response.slice(2), 'hex'))

  if (!decodedAddr) {
    return null
  }

  return { id: formatter.coinType, name: formatter.name, value: decodedAddr }
}

const _getAddr = generateFunction({ encode, decode })

export default _getAddr
