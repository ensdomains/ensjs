import {
  bytesToHex,
  type Address,
  type EncodeFunctionDataParameters,
  type Hex,
} from 'viem'
import { publicResolverSetAddrSnippet } from '../../contracts/publicResolver.js'
import { getCoderFromCoin } from '../normaliseCoinId.js'

export type SetAddrParameters = {
  namehash: Hex
  coin: string | number
  value: Address | string | null
}

export const setAddrParameters = ({
  namehash,
  coin,
  value,
}: SetAddrParameters) => {
  const coder = getCoderFromCoin(coin)
  const inputCoinType = coder.coinType
  let encodedAddress: Hex | Uint8Array = value ? coder.decode(value) : '0x'

  if (inputCoinType === 60 && encodedAddress === '0x')
    encodedAddress = coder.decode('0x0000000000000000000000000000000000000000')
  if (typeof encodedAddress !== 'string') {
    encodedAddress = bytesToHex(encodedAddress)
  }

  return {
    abi: publicResolverSetAddrSnippet,
    functionName: 'setAddr',
    args: [namehash, BigInt(inputCoinType), encodedAddress],
  } as const satisfies EncodeFunctionDataParameters<
    typeof publicResolverSetAddrSnippet
  >
}

export type SetAddrParametersReturnType = ReturnType<typeof setAddrParameters>
