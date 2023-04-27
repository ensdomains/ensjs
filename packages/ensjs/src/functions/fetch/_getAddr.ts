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

const encode = async (
  client: ClientWithEns,
  name: string,
  coinType?: string | number,
  bypassFormat?: boolean,
): Promise<TransactionRequest> => {
  if (!coinType) {
    coinType = 60
  }

  if (coinType === 60 || coinType === '60') {
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
        args: [namehash(name), BigInt(coinType)],
      }),
    }
  }
  const formatter =
    typeof coinType === 'string' && Number.isNaN(parseInt(coinType))
      ? formatsByName[coinType]
      : formatsByCoinType[
          typeof coinType === 'number' ? coinType : parseInt(coinType)
        ]

  if (!formatter) {
    throw new Error(`No formatter found for coin: ${coinType}`)
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
  _name: string,
  coinType?: string | number,
) => {
  let returnCoinType = true
  if (!coinType) {
    coinType = 60
    returnCoinType = false
  }

  const formatter =
    typeof coinType === 'string' && Number.isNaN(parseInt(coinType))
      ? formatsByName[coinType]
      : formatsByCoinType[
          typeof coinType === 'number' ? coinType : parseInt(coinType)
        ]

  let response: Hex

  if (coinType === 60 || coinType === '60') {
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

  if (!returnCoinType) {
    return decodedAddr
  }

  return { coin: formatter.name, addr: decodedAddr }
}

const _getAddr = generateFunction({ encode, decode })

export default _getAddr
