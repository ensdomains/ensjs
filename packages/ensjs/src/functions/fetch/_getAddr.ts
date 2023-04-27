import { formatsByCoinType, formatsByName } from '@ensdomains/address-encoder'
import { Hex, decodeFunctionResult, encodeFunctionData, trim } from 'viem'
import { namehash } from '../../utils/normalise'

import { ClientWithEns } from '../../contracts/addContracts'
import {
  multiAddrSnippet,
  singleAddrSnippet,
} from '../../contracts/publicResolver'
import { TransactionRequest } from '../../types'
import { generateFunction } from '../../utils/generateFunction'

type InternalGetAddrArgs = {
  name: string
  coin?: string | number
  bypassFormat?: boolean
}

type InternalGetAddrResult = {
  id: number
  name: string
  addr: string
}

const encode = async (
  client: ClientWithEns,
  { name, coin, bypassFormat }: InternalGetAddrArgs,
): Promise<TransactionRequest> => {
  if (!coin) {
    coin = 60
  }

  if (coin === 60 || coin === '60') {
    return {
      to: '0x0000000000000000000000000000000000000000',
      data: encodeFunctionData({
        abi: singleAddrSnippet,
        functionName: 'addr',
        args: [namehash(name)],
      }),
    }
  }

  if (bypassFormat) {
    return {
      to: '0x0000000000000000000000000000000000000000',
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

  if (!formatter) {
    throw new Error(`No formatter found for coin: ${coin}`)
  }

  return {
    to: '0x0000000000000000000000000000000000000000',
    data: encodeFunctionData({
      abi: multiAddrSnippet,
      functionName: 'addr',
      args: [namehash(name), BigInt(formatter.coinType)],
    }),
  }
}

const decode = async (
  client: ClientWithEns,
  data: Hex,
  { coin }: InternalGetAddrArgs,
): Promise<InternalGetAddrResult | null> => {
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

  if (trim(response) === '0x') {
    return null
  }

  const decodedAddr = formatter.encoder(Buffer.from(response.slice(2), 'hex'))

  if (!decodedAddr) {
    return null
  }

  return { id: formatter.coinType, name: formatter.name, addr: decodedAddr }
}

const _getAddr = generateFunction({ encode, decode })

export default _getAddr
