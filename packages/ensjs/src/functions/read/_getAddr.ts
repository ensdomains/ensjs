import { formatsByCoinType, formatsByName } from '@ensdomains/address-encoder'
import { Hex, decodeFunctionResult, encodeFunctionData, trim } from 'viem'
import { namehash } from '../../utils/normalise'

import { ClientWithEns } from '../../contracts/addContracts'
import {
  multiAddrSnippet,
  singleAddrSnippet,
} from '../../contracts/publicResolver'
import { CoinFormatterNotFoundError } from '../../errors/read'
import { DecodedAddr, Prettify, SimpleTransactionRequest } from '../../types'
import { EMPTY_ADDRESS } from '../../utils/consts'
import { generateFunction } from '../../utils/generateFunction'

export type InternalGetAddrParameters = {
  name: string
  coin?: string | number
  bypassFormat?: boolean
}

export type InternalGetAddrReturnType = Prettify<DecodedAddr | null>

const encode = (
  _client: ClientWithEns,
  { name, coin, bypassFormat }: InternalGetAddrParameters,
): SimpleTransactionRequest => {
  if (!coin) {
    coin = 60
  }

  if (coin === 60 || coin === '60') {
    return {
      to: EMPTY_ADDRESS,
      data: encodeFunctionData({
        abi: singleAddrSnippet,
        functionName: 'addr',
        args: [namehash(name)],
      }),
    }
  }

  if (bypassFormat) {
    return {
      to: EMPTY_ADDRESS,
      data: encodeFunctionData({
        abi: multiAddrSnippet,
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
      abi: multiAddrSnippet,
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
  if (!coin) {
    coin = 60
  }

  const formatter =
    typeof coin === 'string' && Number.isNaN(parseInt(coin))
      ? formatsByName[coin]
      : formatsByCoinType[typeof coin === 'number' ? coin : parseInt(coin)]

  let response: Hex

  if (coin === 60 || coin === '60') {
    response = decodeFunctionResult({
      abi: singleAddrSnippet,
      functionName: 'addr',
      data,
    })
  } else {
    response = decodeFunctionResult({
      abi: multiAddrSnippet,
      functionName: 'addr',
      data,
    })
  }

  if (!response) return null

  const trimmed = trim(response)
  if (trimmed === '0x' || trimmed === '0x0') {
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
