import {
  type Address,
  type BytesToHexErrorType,
  bytesToHex,
  type EncodeFunctionDataParameters,
  type Hex,
} from 'viem'
import { dedicatedResolverSetAddrSnippet } from '../../contracts/dedicatedResolver.js'
import { publicResolverSetAddrSnippet } from '../../contracts/publicResolver.js'
import type { ErrorType } from '../../errors/utils.js'
import {
  type GetCoderFromCoinErrorType,
  getCoderFromCoin,
} from '../normalizeCoinId.js'

// ================================
// Set address parameters
// ================================

export type SetAddrParametersParameters = {
  namehash?: Hex
  coin: string | number
  value: Address | string | null
}

export type SetAddrParametersErrorType =
  | GetCoderFromCoinErrorType
  | BytesToHexErrorType
  | ErrorType

export const setAddrParameters = ({
  namehash,
  coin,
  value,
}: SetAddrParametersParameters) => {
  const coder = getCoderFromCoin(coin)
  const inputCoinType = coder.coinType
  let encodedAddress: Hex | Uint8Array = value ? coder.decode(value) : '0x'

  if (inputCoinType === 60 && encodedAddress === '0x')
    encodedAddress = coder.decode('0x0000000000000000000000000000000000000000')
  if (typeof encodedAddress !== 'string') {
    encodedAddress = bytesToHex(encodedAddress)
  }

  if (namehash) {
    return {
      abi: publicResolverSetAddrSnippet,
      functionName: 'setAddr',
      args: [namehash, BigInt(inputCoinType), encodedAddress],
    } as const satisfies EncodeFunctionDataParameters<
      typeof publicResolverSetAddrSnippet
    >
  }
  return {
    abi: dedicatedResolverSetAddrSnippet,
    functionName: 'setAddr',
    args: [BigInt(inputCoinType), encodedAddress],
  } as const satisfies EncodeFunctionDataParameters<
    typeof dedicatedResolverSetAddrSnippet
  >
}

export type SetAddrParametersReturnType = ReturnType<typeof setAddrParameters>
