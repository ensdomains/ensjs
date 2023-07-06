import {
  decodeAbiParameters,
  decodeFunctionResult,
  encodeFunctionData,
  labelhash,
  stringToBytes,
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
import { generateFunction } from '../../utils/generateFunction.js'
import { packetToBytes } from '../../utils/hexEncodedName.js'
import { encodeLabelhash } from '../../utils/labels.js'
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
  const calls: (CallObj | null)[] = []
  if (records.texts) {
    for (const key of records.texts) {
      calls.push({
        key,
        call: _getText.encode(client, { name, key }),
        type: 'text',
      })
    }
  }
  if (records.coins) {
    for (const coin of records.coins) {
      calls.push({
        key: coin,
        call: _getAddr.encode(client, { name, coin }),
        type: 'coin',
      })
    }
  }
  if (records.contentHash) {
    calls.push({
      key: 'contentHash',
      call: _getContentHash.encode(client, { name }),
      type: 'contentHash',
    })
  }
  if (records.abi) {
    calls.push({
      key: 'abi',
      call: _getAbi.encode(client, { name }),
      type: 'abi',
    })
  }

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

  // allow names larger than 255 bytes to be resolved
  const formattedName = name
    .split('.')
    .map((label) =>
      stringToBytes(label).byteLength > 255
        ? encodeLabelhash(labelhash(label))
        : label,
    )
    .join('.')

  const encoded = encodeFunctionData({
    abi: universalResolverResolveArraySnippet,
    functionName: 'resolve',
    args: [
      toHex(packetToBytes(formattedName)),
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
  data: Hex,
  passthrough: (CallObj | null)[],
  { name, resolver }: TParams,
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

  const returnedRecords: GetRecordsReturnType<GetRecordsParameters> =
    await Promise.all(
      filteredRecordData.map(async (item, i) => {
        const { key, type } = filteredCalls[i]
        const baseItem = { key, type }
        if (type === 'contentHash') {
          const decodedFromAbi = decodeAbiParameters(
            [{ type: 'bytes' }] as const,
            item,
          )[0]
          if (BigInt(decodedFromAbi) === 0n) {
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
    ).then((results) =>
      results.reduce(
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
        } as GetRecordsReturnType<
          GetRecordsParameters & {
            records: Required<GetRecordsParameters['records']>
          }
        >,
      ),
    )

  return returnedRecords as GetRecordsReturnType<TParams>
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
 * import { addEnsContracts, getRecords } from '@ensdomains/ensjs'
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
