import {
  type Abi,
  type Address,
  type Chain,
  type EncodeFunctionDataErrorType,
  encodeFunctionData,
  type Hex,
  type MulticallErrorType,
  zeroAddress,
} from 'viem'
import { multicall } from 'viem/actions'
import { getAction } from 'viem/utils'
import type { RequireClientContracts } from '../../clients/chain.js'
import type { ErrorType } from '../../errors/utils.js'
import type { DecodedAddr, DecodedText, Prettify } from '../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'
import {
  type DecodeAbiResultErrorType,
  type DecodeAbiResultFromPrimitiveTypesErrorType,
  type DecodeAbiResultReturnType,
  decodeAbiResult,
  decodeAbiResultFromPrimitiveTypes,
  type GetAbiParametersErrorType,
  getAbiParameters,
} from '../../utils/coders/getAbi.js'
import {
  type DecodeAddressResultErrorType,
  type DecodeAddressResultFromPrimitiveTypesErrorType,
  decodeAddressResult,
  decodeAddressResultFromPrimitiveTypes,
  type GetAddressParametersErrorType,
  getAddressParameters,
} from '../../utils/coders/getAddress.js'
import {
  type DecodeContentHashResultErrorType,
  type DecodeContentHashResultFromPrimitiveTypesErrorType,
  decodeContentHashResult,
  decodeContentHashResultFromPrimitiveTypes,
  type GetContentHashErrorType,
  type GetContentHashReturnType,
  getContentHashParameters,
} from '../../utils/coders/getContentHash.js'
import {
  type DecodeTextResultErrorType,
  type DecodeTextResultFromPrimitiveTypesErrorType,
  decodeTextResult,
  decodeTextResultFromPrimitiveTypes,
  type GetTextParametersErrorType,
  getTextParameters,
} from '../../utils/coders/getText.js'
import {
  type ResolveNameDataErrorType,
  resolveNameData,
} from './resolveNameData.js'

export type GetRecordsParameters<
  texts extends readonly string[] | undefined = readonly string[],
  coins extends readonly (string | number)[] | undefined = readonly (
    | string
    | number
  )[],
  contentHash extends boolean | undefined = true,
  abi extends boolean | undefined = true,
> = {
  /** Name to get records for */
  name: string
  /** Text record key array */
  texts?: texts
  /** Coin record id/symbol array */
  coins?: coins
  /** If true, will fetch content hash */
  contentHash?: contentHash
  /** If true, will fetch ABI */
  abi?: abi
  /** Optional specific resolver address, for fallback or for all results */
  resolver?: {
    /** Resolver address */
    address: Address
    /** If true, will only use resolver if main fetch fails */
    fallbackOnly?: boolean
  }
  /** Batch gateway URLs to use for resolving CCIP-read requests. */
  gatewayUrls?: string[]

  /** Don't throw on invalid coinTypes */
  ignoreInvalidCoinTypes?: boolean
}

type WithContentHashResult = {
  /** Retrieved content hash record for name */
  contentHash: GetContentHashReturnType
}

type WithAbiResult = {
  /** Retrieved ABI record for name */
  abi: DecodeAbiResultReturnType
}

type WithTextsResult = {
  /** Retrieved text records for name */
  texts: DecodedText[]
}

type WithCoinsResult = {
  /** Retrieved coins for name */
  coins: DecodedAddr[]
}

type CreateCallsErrorType =
  | GetTextParametersErrorType
  | DecodeTextResultFromPrimitiveTypesErrorType
  | DecodeTextResultErrorType
  | GetAddressParametersErrorType
  | DecodeAddressResultFromPrimitiveTypesErrorType
  | DecodeAddressResultErrorType
  | GetContentHashErrorType
  | DecodeContentHashResultFromPrimitiveTypesErrorType
  | DecodeContentHashResultErrorType
  | GetAbiParametersErrorType
  | DecodeAbiResultFromPrimitiveTypesErrorType
  | DecodeAbiResultErrorType

const createCalls = <
  const texts extends readonly string[] | undefined = undefined,
  const coins extends readonly (string | number)[] | undefined = undefined,
  const contentHash extends boolean | undefined = undefined,
  const abi extends boolean | undefined = undefined,
>({
  name,
  texts,
  coins,
  abi,
  contentHash,
  ignoreInvalidCoinTypes,
}: Pick<
  GetRecordsParameters<texts, coins, contentHash, abi>,
  'name' | 'texts' | 'coins' | 'abi' | 'contentHash' | 'ignoreInvalidCoinTypes'
>) => [
  ...(texts ?? []).map(
    (text) =>
      ({
        parameters: getTextParameters({ name, key: text }),
        addToResult: <shouldDecodeFromPrimitiveTypes extends boolean>({
          currentResult,
          data,
          shouldDecodeFromPrimitiveTypes,
        }: {
          currentResult: GetRecordsReturnType
          shouldDecodeFromPrimitiveTypes: shouldDecodeFromPrimitiveTypes
          data: shouldDecodeFromPrimitiveTypes extends true ? string : Hex
        }) => {
          const result = shouldDecodeFromPrimitiveTypes
            ? decodeTextResultFromPrimitiveTypes({ decodedData: data })
            : decodeTextResult(data as Hex, { strict: false })
          if (!result) return

          currentResult.texts.push({ key: text, value: result })
        },
      }) as const,
  ),
  ...(coins ?? []).map(
    (coin) =>
      ({
        parameters: getAddressParameters({
          name,
          coin,
          ignoreInvalidCoinTypes,
        }),
        addToResult: <shouldDecodeFromPrimitiveTypes extends boolean>({
          currentResult,
          data,
          shouldDecodeFromPrimitiveTypes,
        }: {
          currentResult: GetRecordsReturnType
          shouldDecodeFromPrimitiveTypes: shouldDecodeFromPrimitiveTypes
          data: Hex
        }) => {
          try {
            const result = shouldDecodeFromPrimitiveTypes
              ? decodeAddressResultFromPrimitiveTypes({
                  decodedData: data,
                  coin,
                })
              : decodeAddressResult(data, { coin, strict: false })

            if (!result) return

            currentResult.coins.push(result)
          } catch (e) {
            console.error(e)
            // Don't panic if coming across an unknown coinType
            return
          }
        },
      }) as const,
  ),
  ...(contentHash
    ? ([
        {
          parameters: getContentHashParameters({ name }),
          addToResult: <shouldDecodeFromPrimitiveTypes extends boolean>({
            currentResult,
            data,
            shouldDecodeFromPrimitiveTypes,
          }: {
            currentResult: GetRecordsReturnType
            shouldDecodeFromPrimitiveTypes: shouldDecodeFromPrimitiveTypes
            data: Hex
          }) => {
            const result = shouldDecodeFromPrimitiveTypes
              ? decodeContentHashResultFromPrimitiveTypes({ decodedData: data })
              : decodeContentHashResult(data, { strict: false })
            if (!result) return

            currentResult.contentHash = result
          },
        },
      ] as const)
    : []),
  ...(abi
    ? ([
        {
          parameters: getAbiParameters({ name }),
          addToResult: async <shouldDecodeFromPrimitiveTypes extends boolean>({
            currentResult,
            data,
            shouldDecodeFromPrimitiveTypes,
          }: {
            currentResult: GetRecordsReturnType
            shouldDecodeFromPrimitiveTypes: shouldDecodeFromPrimitiveTypes
            data: shouldDecodeFromPrimitiveTypes extends true
              ? readonly [bigint, Hex]
              : Hex
          }) => {
            const result = shouldDecodeFromPrimitiveTypes
              ? await decodeAbiResultFromPrimitiveTypes({
                  decodedData: data as readonly [bigint, Hex],
                })
              : await decodeAbiResult(data as Hex, { strict: false })
            if (!result) return

            currentResult.abi = result
          },
        },
      ] as const)
    : []),
]

const createEmptyResult = <
  texts extends readonly string[] | undefined,
  coins extends readonly (string | number)[] | undefined,
  contentHash extends boolean | undefined,
  abi extends boolean | undefined,
>({
  texts,
  coins,
  abi,
  contentHash,
}: Pick<
  GetRecordsParameters<texts, coins, contentHash, abi>,
  'texts' | 'coins' | 'abi' | 'contentHash'
>) =>
  ({
    ...(texts ? { texts: [] as DecodedText[] } : {}),
    ...(coins ? { coins: [] as DecodedAddr[] } : {}),
    ...(contentHash ? { contentHash: null } : {}),
    ...(abi ? { abi: null } : {}),
    resolverAddress: zeroAddress as Address,
  }) as GetRecordsReturnType

export type GetRecordsReturnType<
  texts extends readonly string[] | undefined = readonly string[],
  coins extends readonly (string | number)[] | undefined = readonly (
    | string
    | number
  )[],
  contentHash extends boolean | undefined = true,
  abi extends boolean | undefined = true,
> = Prettify<
  (contentHash extends true ? WithContentHashResult : {}) &
    (abi extends true ? WithAbiResult : {}) &
    (texts extends readonly string[] ? WithTextsResult : {}) &
    (coins extends readonly (string | number)[] ? WithCoinsResult : {}) & {
      /** Resolver address used for fetch */
      resolverAddress: Address
    }
>

export type GetRecordsErrorType =
  | CreateCallsErrorType
  | MulticallErrorType
  | ResolveNameDataErrorType
  | EncodeFunctionDataErrorType
  | ErrorType

/**
 * Gets arbitrary records for a name
 * @param client - {@link Client}
 * @param parameters - {@link GetRecordsParameters}
 * @returns Records data object. {@link GetRecordsReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getRecords } from '@ensdomains/ensjs/public'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getRecords(client, {
 *   name: 'ens.eth',
 *   texts: ['com.twitter', 'com.github'],
 *   coins: ['ETH'],
 *   contentHash: true,
 * })
 * // { texts: [{ key: 'com.twitter', value: 'ensdomains' }, { key: 'com.github', value: 'ensdomains' }], coins: [{ id: 60, name: 'ETH', value: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7' }], contentHash: { protocolType: 'ipns', decoded: 'k51qzi5uqu5djdczd6zw0grmo23j2vkj9uzvujencg15s5rlkq0ss4ivll8wqw' } }
 */
export async function getRecords<
  chain extends Chain,
  const texts extends readonly string[] | undefined = undefined,
  const coins extends readonly (string | number)[] | undefined = undefined,
  const contentHash extends boolean | undefined = undefined,
  const abi extends boolean | undefined = undefined,
>(
  client: RequireClientContracts<chain, 'ensUniversalResolver' | 'multicall3'>,
  {
    name,
    resolver,
    texts,
    coins,
    contentHash,
    abi,
    gatewayUrls,
    ignoreInvalidCoinTypes,
  }: GetRecordsParameters<texts, coins, contentHash, abi>,
): Promise<GetRecordsReturnType<texts, coins, contentHash, abi>> {
  ASSERT_NO_TYPE_ERROR(client)

  const calls = createCalls({
    name,
    texts,
    coins,
    contentHash,
    abi,
    ignoreInvalidCoinTypes,
  })
  const currentResult = createEmptyResult({ texts, coins, contentHash, abi })

  if (resolver?.address && !resolver.fallbackOnly) {
    const multicallAction = getAction(client, multicall, 'multicall')
    const result = await multicallAction({
      contracts: calls.map((c) => ({
        address: resolver.address,
        ...c.parameters,
      })),
    })
    currentResult.resolverAddress = resolver.address
    await Promise.all(
      result.map(async (item, i) => {
        if (item.status !== 'success') return

        const callItem = calls[i]
        await callItem.addToResult({
          currentResult,
          data: item.result as never,
          shouldDecodeFromPrimitiveTypes: true,
        })
      }),
    )
  } else {
    const resolveNameDataAction = getAction(
      client,
      resolveNameData,
      'resolveNameData',
    )
    const result = await resolveNameDataAction({
      name,
      data: calls.map((c) => encodeFunctionData<Abi>(c?.parameters)),
      gatewayUrls,
    })
    if (!result)
      return currentResult as GetRecordsReturnType<
        texts,
        coins,
        contentHash,
        abi
      >

    currentResult.resolverAddress = result.resolverAddress

    await Promise.all(
      result.resolvedData.map(async (item, i) => {
        if (!item.success) return

        const callItem = calls[i]
        await callItem.addToResult({
          currentResult,
          data: item.returnData,
          shouldDecodeFromPrimitiveTypes: false,
        })
      }),
    )
  }

  return currentResult as GetRecordsReturnType<texts, coins, contentHash, abi>
}
