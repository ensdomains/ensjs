import { publicResolverSetAddrSnippet } from '@ensdomains/ensjs-abi/v1/publicResolver'
import {
  type Address,
  type BytesToHexErrorType,
  bytesToHex,
  type EncodeFunctionDataParameters,
  type Hex,
  type NamehashErrorType,
  namehash,
} from 'viem'
import type { ErrorType } from '../../errors/utils.js'
import {
  type GetCoderFromCoinErrorType,
  getCoderFromCoin,
} from '../normalizeCoinId.js'

// ================================
// Set address parameters
// ================================

export type SetAddrParametersParameters = {
  /** Name to set address record for (namehash is computed internally) */
  name: string
  coin: string | number
  value: Address | string | null
}

export type SetAddrParametersErrorType =
  | GetCoderFromCoinErrorType
  | BytesToHexErrorType
  | ErrorType
  | NamehashErrorType

export const setAddrParameters = ({
  name,
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

  return {
    abi: publicResolverSetAddrSnippet,
    functionName: 'setAddr',
    args: [namehash(name), BigInt(inputCoinType), encodedAddress],
  } as const satisfies EncodeFunctionDataParameters<
    typeof publicResolverSetAddrSnippet
  >
}

export type SetAddrParametersReturnType = ReturnType<typeof setAddrParameters>
