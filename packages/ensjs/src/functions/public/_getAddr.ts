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
  if (coin === 60 || coin === '60' || coin === 'eth') {
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
    typeof coin === 'string' && Number.isNaN(parseInt(coin))
      ? formatsByName[coin]
      : formatsByCoinType[typeof coin === 'number' ? coin : parseInt(coin)]

  if (!formatter) throw new CoinFormatterNotFoundError({ coinType: coin })

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
  { coin }: InternalGetAddrParameters,
): Promise<InternalGetAddrReturnType> => {
  if (data === '0x') return null
  if (!coin) {
    coin = 60
  }

  const formatter =
    typeof coin === 'string' && Number.isNaN(parseInt(coin))
      ? formatsByName[coin]
      : formatsByCoinType[typeof coin === 'number' ? coin : parseInt(coin)]

  let response: Hex

  if (coin === 60 || coin === '60' || coin === 'eth') {
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
