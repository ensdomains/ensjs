import { formatsByCoinType, formatsByName } from '@ensdomains/address-encoder'
import { Address, Hex, bytesToHex, encodeFunctionData } from 'viem'
import { setAddrSnippet } from '../../contracts/publicResolver'

export type EncodeSetAddrParameters = {
  namehash: Hex
  coin: string | number
  value: Address | string | null
}

export const encodeSetAddr = ({
  namehash,
  coin,
  value,
}: EncodeSetAddrParameters) => {
  let coinTypeInstance
  if (typeof coin === 'number') {
    coinTypeInstance = formatsByCoinType[coin]
  } else if (!Number.isNaN(parseInt(coin))) {
    coinTypeInstance = formatsByCoinType[parseInt(coin)]
  } else {
    coinTypeInstance = formatsByName[coin.toUpperCase()]
  }
  const inputCoinType = coinTypeInstance.coinType
  let encodedAddress: Hex | Uint8Array = value
    ? coinTypeInstance.decoder(value)
    : '0x'
  if (inputCoinType === 60 && encodedAddress === '0x')
    encodedAddress = coinTypeInstance.decoder(
      '0x0000000000000000000000000000000000000000',
    )
  if (typeof encodedAddress !== 'string') {
    encodedAddress = bytesToHex(encodedAddress)
  }

  return encodeFunctionData({
    abi: setAddrSnippet,
    functionName: 'setAddr',
    args: [namehash, BigInt(inputCoinType), encodedAddress],
  })
}
