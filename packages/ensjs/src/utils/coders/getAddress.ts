import {
  decodeFunctionResult,
  hexToBytes,
  trim,
  type Address,
  type Hex,
} from 'viem'
import {
  publicResolverMultiAddrSnippet,
  publicResolverSingleAddrSnippet,
} from '../../contracts/publicResolver.js'
import type { DecodedAddr, Prettify } from '../../types.js'
import { namehash } from '../normalise.js'
import { getCoderFromCoin } from '../normaliseCoinId.js'

const defaultCoinValue = 60 as const

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

export type GetAddressReturnType<
  coin extends number | string | undefined = undefined,
> = Prettify<ResolveCoinReturnType<
  undefined extends coin
    ? typeof defaultCoinValue
    : coin extends number | string
    ? coin
    : string
> | null>

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

export function getAddressParameters<
  coin extends number | string | undefined = undefined,
>({
  name,
  coin = defaultCoinValue,
  bypassFormat,
}: Omit<GetAddressParameters<coin>, 'strict'>) {
  const coder = getCoderFromCoin(coin)

  if (coder.coinType === 60)
    return {
      abi,
      functionName: 'addr',
      args: [namehash(name)],
    } as const

  return {
    abi,
    functionName: 'addr',
    args: [namehash(name), BigInt(bypassFormat ? coin : coder.coinType)],
  } as const
}

export function decodeAddressResultFromPrimitiveTypes<
  coin extends number | string | undefined = undefined,
>({
  decodedData,
  coin = defaultCoinValue,
}: {
  decodedData: Hex
  coin: coin
}): GetAddressReturnType<coin> {
  const coder = getCoderFromCoin(coin)

  const trimmed = trim(decodedData)
  if (trimmed === '0x' || trimmed === '0x0' || trimmed === '0x00') return null

  const decodedAddr = coder.encode(hexToBytes(decodedData))

  if (!decodedAddr) return null

  return {
    coinType: coder.coinType,
    symbol: coder.name,
    value: decodedAddr,
  } as GetAddressReturnType<coin>
}

export function decodeAddressResult<
  coin extends number | string | undefined = undefined,
>(
  data: Hex,
  {
    coin = defaultCoinValue,
    strict,
  }: Pick<GetAddressParameters<coin>, 'coin' | 'strict'>,
): GetAddressReturnType<coin> {
  if (data === '0x') return null

  const coder = getCoderFromCoin(coin)

  try {
    const decodedData =
      coder.coinType === 60
        ? decodeFunctionResult({
            abi: publicResolverSingleAddrSnippet,
            functionName: 'addr',
            data,
          })
        : decodeFunctionResult({
            abi: publicResolverMultiAddrSnippet,
            functionName: 'addr',
            data,
          })

    return decodeAddressResultFromPrimitiveTypes({
      decodedData,
      coin,
    }) as GetAddressReturnType<coin>
  } catch (error) {
    if (strict) throw error
    return null
  }
}
