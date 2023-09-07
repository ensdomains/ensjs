import {
  BaseError,
  decodeAbiParameters,
  decodeErrorResult,
  decodeFunctionResult,
  encodeFunctionData,
  getContractError,
  hexToBigInt,
  toHex,
  type Address,
  type Hex,
} from 'viem'
import type { ClientWithEns } from '../../contracts/consts.js'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import { universalResolverResolveArraySnippet } from '../../contracts/universalResolver.js'
import type {
  DecodedAddr,
  DecodedText,
  SimpleTransactionRequest,
  TransactionRequestWithPassthrough,
} from '../../types.js'
import { EMPTY_ADDRESS } from '../../utils/consts.js'
import { generateFunction } from '../../utils/generateFunction.js'
import { getRevertErrorData } from '../../utils/getRevertErrorData.js'
import { packetToBytes } from '../../utils/hexEncodedName.js'
import _getAbi, { type InternalGetAbiReturnType } from './_getAbi.js'
import _getAddr from './_getAddr.js'
import _getContentHash, {
  type InternalGetContentHashReturnType,
} from './_getContentHash.js'
import _getText from './_getText.js'
import multicallWrapper from './multicallWrapper.js'

export type GetRecordsParameters = {
  /** Name to get records for */
  name: string
  /** Optional specific resolver address, for fallback or for all results */
  resolver?: {
    /** Resolver address */
    address: Address
    /** If true, will only use resolver if main fetch fails */
    fallbackOnly?: boolean
  }
  /** Records to fetch */
  records: {
    /** Text record key array */
    texts?: string[]
    /** Coin record id/symbol array */
    coins?: (string | number)[]
    /** If true, will fetch content hash */
    contentHash?: boolean
    /** If true, will fetch ABI */
    abi?: boolean
  }
}

type WithContentHashResult = {
  /** Retrieved content hash record for name */
  contentHash: InternalGetContentHashReturnType
}

type WithAbiResult = {
  /** Retrieved ABI record for name */
  abi: InternalGetAbiReturnType
}

type WithTextsResult = {
  /** Retrieved text records for name */
  texts: DecodedText[]
}

type WithCoinsResult = {
  /** Retrieved coins for name */
  coins: DecodedAddr[]
}

type BaseGetRecordsReturnType = Partial<
  WithContentHashResult & WithAbiResult & WithTextsResult & WithCoinsResult
> & {
  /** Resolver address used for fetch */
  resolverAddress: Address
}

export type GetRecordsReturnType<
  TParams extends GetRecordsParameters = GetRecordsParameters,
> = TParams['records'] extends undefined
  ? BaseGetRecordsReturnType
  : (TParams['records']['contentHash'] extends true
      ? WithContentHashResult
      : {}) &
      (TParams['records']['abi'] extends true ? WithAbiResult : {}) &
      (TParams['records']['texts'] extends string[] ? WithTextsResult : {}) &
      (TParams['records']['coins'] extends (string | number)[]
        ? WithCoinsResult
        : {}) & {
        /** Resolver address used for fetch */
        resolverAddress: Address
      }

type CallObj = {
  key: string | number
  call: SimpleTransactionRequest
  type: 'coin' | 'text' | 'contentHash' | 'abi'
}

const encode = (
  client: ClientWithEns,
  { name, resolver, records }: GetRecordsParameters,
): TransactionRequestWithPassthrough => {
  const calls = Object.keys(records).reduce((prev, key) => {
    if (key === 'texts') {
      return [
        ...prev,
        ...records.texts!.map(
          (text) =>
            ({
              key: text,
              call: _getText.encode(client, { name, key: text }),
              type: 'text',
            } as const),
        ),
      ]
    }
    if (key === 'coins') {
      return [
        ...prev,
        ...records.coins!.map(
          (coin) =>
            ({
              key: coin,
              call: _getAddr.encode(client, { name, coin }),
              type: 'coin',
            } as const),
        ),
      ]
    }
    if (key === 'contentHash') {
      return [
        ...prev,
        {
          key: 'contentHash',
          call: _getContentHash.encode(client, { name }),
          type: 'contentHash',
        } as const,
      ]
    }
    if (key === 'abi') {
      return [
        ...prev,
        {
          key: 'abi',
          call: _getAbi.encode(client, { name }),
          type: 'abi',
        } as const,
      ]
    }
    return prev
  }, [] as (CallObj | null)[])

  const passthrough = calls

  if (resolver?.address && !resolver.fallbackOnly) {
    const encoded = multicallWrapper.encode(client, {
      transactions: calls
        .filter((c) => c)
        .map((c) => ({ to: resolver.address, data: c!.call.data })),
    })
    return {
      ...encoded,
      passthrough,
    }
  }

  const encoded = encodeFunctionData({
    abi: universalResolverResolveArraySnippet,
    functionName: 'resolve',
    args: [
      toHex(packetToBytes(name)),
      calls.filter((c) => c).map((c) => c!.call.data),
    ],
  })

  return {
    to: getChainContractAddress({ client, contract: 'ensUniversalResolver' }),
    data: encoded,
    passthrough,
  }
}

const decode = async <TParams extends GetRecordsParameters>(
  client: ClientWithEns,
  data: Hex | BaseError,
  passthrough: (CallObj | null)[],
  { name, resolver, records: recordsParams }: TParams,
): Promise<GetRecordsReturnType<TParams>> => {
  const calls = passthrough
  let recordData: (Hex | null)[] = []
  let resolverAddress: Address

  if (resolver?.address && !resolver.fallbackOnly) {
    const result = await multicallWrapper.decode(
      client,
      data,
      passthrough.filter((c) => c).map((c) => c!.call),
    )
    resolverAddress = resolver.address
    recordData = result.map((r) => r.returnData)
  } else {
    if (typeof data === 'object') {
      const errorData = getRevertErrorData(data)
      if (errorData) {
        const decodedError = decodeErrorResult({
          abi: universalResolverResolveArraySnippet,
          data: errorData,
        })
        if (
          decodedError.errorName === 'ResolverNotFound' ||
          decodedError.errorName === 'ResolverWildcardNotSupported'
        )
          return passthrough.reduce(
            (prev, curr) => {
              if (!curr) return prev
              if (curr.type === 'coin' && !('coin' in prev)) {
                return { ...prev, coins: [] }
              }
              if (curr.type === 'text' && !('texts' in prev)) {
                return { ...prev, texts: [] }
              }
              if (curr.type === 'contentHash' && !('contentHash' in prev)) {
                return { ...prev, contentHash: null }
              }
              // abi
              return { ...prev, abi: null }
            },
            {
              resolverAddress: EMPTY_ADDRESS,
            } as unknown as GetRecordsReturnType<TParams>,
          )
      }
      throw getContractError(data, {
        abi: universalResolverResolveArraySnippet,
        functionName: 'resolve',
        args: [
          toHex(packetToBytes(name)),
          calls.filter((c) => c).map((c) => c!.call.data),
        ],
        address: getChainContractAddress({
          client,
          contract: 'ensUniversalResolver',
        }),
      })
    }
    const result = decodeFunctionResult({
      abi: universalResolverResolveArraySnippet,
      functionName: 'resolve',
      data,
    })
    ;[, resolverAddress] = result
    recordData = [...result[0]]
    for (let i = 0; i < recordData.length; i += 1) {
      // error code for reverted call in batch
      // this is expected when using offchain resolvers, so should be ignored
      // Error((uint16, string)[])
      // or if data is 0x, clear the call so there is no decoding errors
      if (recordData[i]!.startsWith('0x0d1947a9') || recordData[i] === '0x') {
        calls[i] = null
        recordData[i] = null
      }
    }
  }

  const filteredCalls = calls.filter((x) => x) as CallObj[]
  const filteredRecordData = recordData.filter((x) => x) as Hex[]

  const decodedRecords = await Promise.all(
    filteredRecordData.map(async (item, i) => {
      const { key, type } = filteredCalls[i]
      const baseItem = { key, type }
      if (type === 'contentHash') {
        const decodedFromAbi = decodeAbiParameters(
          [{ type: 'bytes' }] as const,
          item,
        )[0]
        if (decodedFromAbi === '0x' || hexToBigInt(decodedFromAbi) === 0n) {
          return { ...baseItem, value: null }
        }
      }
      if (type === 'text') {
        const decodedFromAbi = await _getText.decode(client, item)
        return { ...baseItem, value: decodedFromAbi }
      }
      if (type === 'coin') {
        const decodedFromAbi = await _getAddr.decode(client, item, {
          name,
          coin: key,
        })
        return { ...baseItem, value: decodedFromAbi }
      }
      if (type === 'contentHash') {
        const decodedFromAbi = await _getContentHash.decode(client, item)
        return { ...baseItem, value: decodedFromAbi }
      }
      // abi
      const decodedFromAbi = await _getAbi.decode(client, item)
      return { ...baseItem, value: decodedFromAbi }
    }),
  )

  const records = decodedRecords.reduce(
    (prev, curr) => {
      if (curr.type === 'text' || curr.type === 'coin') {
        if (!curr.value) {
          return prev
        }
      }
      if (curr.type === 'text') {
        return {
          ...prev,
          texts: [
            ...(prev.texts || []),
            { key: curr.key, value: curr.value } as DecodedText,
          ],
        }
      }
      if (curr.type === 'coin') {
        return {
          ...prev,
          coins: [...(prev.coins || []), curr.value as DecodedAddr],
        }
      }
      if (curr.type === 'contentHash') {
        return {
          ...prev,
          contentHash: curr.value as InternalGetContentHashReturnType,
        }
      }
      // abi
      return { ...prev, abi: curr.value as InternalGetAbiReturnType }
    },
    {
      resolverAddress,
      ...('texts' in recordsParams ? { texts: [] } : {}),
      ...('coins' in recordsParams ? { coins: [] } : {}),
      ...('contentHash' in recordsParams ? { contentHash: null } : {}),
    } as GetRecordsReturnType<
      GetRecordsParameters & {
        records: Required<GetRecordsParameters['records']>
      }
    >,
  )

  return records as GetRecordsReturnType<TParams>
}

type EncoderFunction = typeof encode
type DecoderFunction = typeof decode<any>

type BatchableFunctionObject = {
  encode: EncoderFunction
  decode: DecoderFunction
  batch: <TParams extends GetRecordsParameters>(
    args: TParams,
  ) => {
    args: [TParams]
    encode: EncoderFunction
    decode: typeof decode<TParams>
  }
}

/**
 * Gets arbitrary records for a name
 * @param client - {@link ClientWithEns}
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
 *   records: {
 *     texts: ['com.twitter', 'com.github'],
 *     coins: ['ETH'],
 *     contentHash: true,
 *   },
 * })
 * // { texts: [{ key: 'com.twitter', value: 'ensdomains' }, { key: 'com.github', value: 'ensdomains' }], coins: [{ id: 60, name: 'ETH', value: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7' }], contentHash: { protocolType: 'ipns', decoded: 'k51qzi5uqu5djdczd6zw0grmo23j2vkj9uzvujencg15s5rlkq0ss4ivll8wqw' } }
 */
const getRecords = generateFunction({ encode, decode }) as (<
  TParams extends GetRecordsParameters,
>(
  client: ClientWithEns,
  { name, records, resolver }: TParams,
) => Promise<GetRecordsReturnType<TParams>>) &
  BatchableFunctionObject

export default getRecords
