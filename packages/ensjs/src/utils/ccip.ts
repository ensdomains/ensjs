import { BigNumber } from '@ethersproject/bignumber'
import {
  Hex,
  PublicClient,
  concat,
  encodeAbiParameters,
  hexToString,
  slice,
} from 'viem'
import { TransactionRequest } from '../types'

function _parseBytes(result: Hex, start: number): null | Hex {
  if (result === '0x') {
    return null
  }

  const offset = parseInt(slice(result, start, start + 32))
  const length = parseInt(slice(result, offset, offset + 32))

  return slice(result, offset + 32, offset + 32 + length)
}

function _parseString(result: Hex, start: number): null | string {
  try {
    const bytes = _parseBytes(result, start)
    if (bytes == null) return null
    return hexToString(bytes)
  } catch (error) {}
  return null
}

const ccipReadFetch = async (
  tx: TransactionRequest,
  calldata: Hex,
  urls: string[],
): Promise<null | Hex> => {
  if (urls.length === 0) {
    return null
  }

  const sender = tx.to!.toLowerCase()
  const data = calldata.toLowerCase()

  const errorMessages: Array<string> = []

  for (let i = 0; i < urls.length; i += 1) {
    const url = urls[i]

    // URL expansion
    const href = url.replace('{sender}', sender).replace('{data}', data)

    // If no {data} is present, use POST; otherwise GET
    const json: string | null =
      url.indexOf('{data}') >= 0 ? null : JSON.stringify({ data, sender })

    /* eslint-disable no-await-in-loop */
    const result = await fetch(href, {
      method: json === null ? 'GET' : 'POST',
      body: json,
    })
    const returnedData = await result.text()
    /* eslint-enable no-await-in-loop */

    if (returnedData) return returnedData as Hex

    const errorMessage = result.statusText || 'unknown error'

    if (result.status >= 400 && result.status < 500) {
      throw new Error(`response not found during CCIP fetch: ${errorMessage}`)
    }

    // 5xx indicates server issue; try the next url
    errorMessages.push(errorMessage)
  }

  throw new Error(
    `error encountered during CCIP fetch: ${errorMessages
      .map((m) => JSON.stringify(m))
      .join(', ')}`,
  )
}

const ccipLookup = async (
  client: PublicClient,
  transaction: TransactionRequest,
  result: Hex,
) => {
  const txSender = transaction.to!
  const data = slice(result, 4)

  // Check the sender of the OffchainLookup matches the transaction
  const sender = slice(data, 0, 32)
  if (!BigNumber.from(sender).eq(txSender)) {
    throw new Error('CCIP Read sender did not match')
  }

  // Read the URLs from the response
  const urls: Array<string> = []
  const urlsOffset = parseInt(slice(data, 32, 64), 16)
  const urlsLength = parseInt(slice(data, urlsOffset, urlsOffset + 32))
  const urlsData = slice(data, urlsOffset + 32)
  for (let u = 0; u < urlsLength; u += 1) {
    const url = _parseString(urlsData, u * 32)
    if (url == null) {
      throw new Error('CCIP Read contained corrupt URL string')
    }
    urls.push(url)
  }

  // Get the CCIP calldata to forward
  const calldata = _parseBytes(data, 64) as Hex

  // Get the callbackSelector (bytes4)
  if (BigInt(slice(data, 100, 128)) !== 0n) {
    throw new Error('CCIP Read callback selected included junk')
  }
  const callbackSelector = slice(data, 96, 100)

  // Get the extra data to send back to the contract as context
  const extraData = _parseBytes(data, 128)

  const ccipResult = await ccipReadFetch(transaction, calldata!, urls)
  if (ccipResult == null) {
    throw new Error('CCIP Read disabled or provided no URLs')
  }

  const tx = {
    to: txSender,
    data: concat([
      callbackSelector,
      encodeAbiParameters(
        [{ type: 'bytes' }, { type: 'bytes' }],
        [ccipResult, extraData!],
      ),
    ]),
  }

  return client.call(tx).then((d) => d.data)
}

export default ccipLookup
