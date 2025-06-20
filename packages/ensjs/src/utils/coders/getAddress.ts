import {
  type Address,
  type DecodeFunctionResultErrorType,
  decodeFunctionResult,
  type Hex,
  type HexToBytesErrorType,
  hexToBytes,
  type NamehashErrorType,
  namehash,
  type TrimErrorType,
  trim,
} from 'viem'
import { type NormalizeErrorType, normalize } from 'viem/ens'
import {
  publicResolverMultiAddrSnippet,
  publicResolverSingleAddrSnippet,
} from '../../contracts/publicResolver.js'
import type { ErrorType } from '../../errors/utils.js'
import type { DecodedAddr, Prettify } from '../../types/index.js'
import {
  type GetCoderFromCoinErrorType,
  getCoderFromCoin,
} from '../normalizeCoinId.js'

const defaultCoinValue = 60 as const

/** @deprecated */
export type GetAddressParameters<
  coin extends number | string | undefined = undefined,
> = {
  /** Name to get the address record for */
  name: string
  /** Coin to get the address record for, can be either symbol (string) or coinId (number) (default: `60`) */
  coin?: coin
  /** Optionally return raw bytes value of address record (default: false) */
  bypassFormat?: boolean
  /** Whether or not to throw decoding errors */
  strict?: boolean
}

/** @deprecated */
export type GetAddressReturnType<
  coin extends number | string | undefined = undefined,
> = Prettify<ResolveCoinReturnType<
  undefined extends coin
    ? typeof defaultCoinValue
    : coin extends number | string
      ? coin
      : string
> | null>

/** @deprecated */
export type GetAddressErrorType = Error

type ResolveCoinReturnType<coin extends number | string> = coin extends
  | 60
  | 'eth'
  ? {
      coinType: 60
      symbol: 'eth'
      value: Address
    }
  : DecodedAddr

const abi = [
  ...publicResolverSingleAddrSnippet,
  ...publicResolverMultiAddrSnippet,
] as const

// ================================
// Get address parameters
// ================================

export type GetAddressParametersParameters<
  coin extends number | string | undefined = undefined,
> = {
  /** Name to get the address record for */
  name: string
  /** Coin to get the address record for, can be either symbol (string) or coinId (number) (default: `60`) */
  coin?: coin
  /** Optionally return raw bytes value of address record (default: false) */
  bypassFormat?: boolean
}

export type GetAddressParametersErrorType =
  | GetCoderFromCoinErrorType
  | NamehashErrorType
  | NormalizeErrorType

export function getAddressParameters<
  coin extends number | string | undefined = undefined,
>({
  name,
  coin = defaultCoinValue,
  bypassFormat,
}: GetAddressParametersParameters<coin>) {
  // may throw GetCoderFromCoinErrorType
  const coder = getCoderFromCoin(coin)

  if (coder.coinType === 60)
    return {
      abi,
      functionName: 'addr',
      args: [
        // may throw NamehashErrorType
        namehash(
          // may throw NormalizeErrorType
          normalize(name),
        ),
      ],
    } as const

  return {
    abi,
    functionName: 'addr',
    args: [
      // may throw NamehashErrorType
      namehash(
        // may throw NormalizeErrorType
        normalize(name),
      ),
      BigInt(bypassFormat ? coin : coder.coinType),
    ],
  } as const
}

// ================================
// Decode address result from primitive types
// ================================

export type DecodeAddressResultFromPrimitiveTypesParameters<
  coin extends number | string | undefined = undefined,
> = {
  decodedData: Hex
  coin: coin
}

export type DecodeAddressResultFromPrimitiveTypesReturnType<
  coin extends number | string | undefined = undefined,
> = Prettify<ResolveCoinReturnType<
  undefined extends coin
    ? typeof defaultCoinValue
    : coin extends number | string
      ? coin
      : string
> | null>

export type DecodeAddressResultFromPrimitiveTypesErrorType =
  | GetCoderFromCoinErrorType
  | TrimErrorType
  | HexToBytesErrorType
  | ErrorType

export function decodeAddressResultFromPrimitiveTypes<
  coin extends number | string | undefined = undefined,
>({
  decodedData,
  coin = defaultCoinValue,
}: DecodeAddressResultFromPrimitiveTypesParameters<coin>): DecodeAddressResultFromPrimitiveTypesReturnType<coin> {
  // may throw GetCoderFromCoinErrorType
  const coder = getCoderFromCoin(coin)

  // may throw TrimErrorType
  const trimmed = trim(decodedData)
  if (trimmed === '0x' || trimmed === '0x0' || trimmed === '0x00') return null

  // could throw Error
  const decodedAddr = coder.encode(
    // may throw HexToBytesErrorType
    hexToBytes(decodedData),
  )

  if (!decodedAddr) return null

  return {
    coinType: coder.coinType,
    symbol: coder.name,
    value: decodedAddr,
  } as DecodeAddressResultFromPrimitiveTypesReturnType<coin>
}

// ================================
// Decode address result
// ================================

export type DecodeAddressResultParameters<
  coin extends number | string | undefined = undefined,
> = {
  /** Coin to get the address record for, can be either symbol (string) or coinId (number) (default: `60`) */
  coin?: coin
  /** Whether or not to throw decoding errors */
  strict?: boolean
}

export type DecodeAddressResultReturnType<
  coin extends number | string | undefined = undefined,
> = DecodeAddressResultFromPrimitiveTypesReturnType<coin>

export type DecodeAddressResultErrorType =
  | GetCoderFromCoinErrorType
  | DecodeFunctionResultErrorType
  | ErrorType

export function decodeAddressResult<
  coin extends number | string | undefined = undefined,
>(
  data: Hex,
  { coin = defaultCoinValue, strict }: DecodeAddressResultParameters<coin>,
): DecodeAddressResultReturnType<coin> {
  if (data === '0x') return null

  // may throw GetCoderFromCoinErrorType
  const coder = getCoderFromCoin(coin)

  try {
    const decodedData =
      coder.coinType === 60
        ? // may throw DecodeFunctionResultErrorType
          decodeFunctionResult({
            abi: publicResolverSingleAddrSnippet,
            functionName: 'addr',
            data,
          })
        : // may throw DecodeFunctionResultErrorType
          decodeFunctionResult({
            abi: publicResolverMultiAddrSnippet,
            functionName: 'addr',
            data,
          })

    return decodeAddressResultFromPrimitiveTypes({
      decodedData,
      coin: coin as coin,
    })
  } catch (error) {
    if (strict) throw error
    return null
  }
}
