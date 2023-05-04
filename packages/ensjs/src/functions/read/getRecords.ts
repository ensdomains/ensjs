import {
  Address,
  Hex,
  decodeAbiParameters,
  decodeFunctionResult,
  encodeFunctionData,
  labelhash,
  stringToBytes,
  toHex,
} from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { resolveArraySnippet } from '../../contracts/universalResolver'
import {
  DecodedAddr,
  DecodedText,
  Prettify,
  SimpleTransactionRequest,
  TransactionRequestWithPassthrough,
} from '../../types'
import {
  GeneratedFunction,
  generateFunction,
} from '../../utils/generateFunction'
import { packetToBytes } from '../../utils/hexEncodedName'
import { encodeLabelhash } from '../../utils/labels'
import _getAbi, { InternalGetAbiReturnType } from './_getAbi'
import _getAddr from './_getAddr'
import _getContentHash, {
  InternalGetContentHashReturnType,
} from './_getContentHash'
import _getText from './_getText'
import multicallWrapper from './multicallWrapper'

export type GetRecordsParameters = {
  name: string
  resolver?: {
    address: Address
    fallbackOnly?: boolean
  }
  records: {
    texts?: string[]
    coins?: (string | number)[]
    contentHash?: boolean
    abi?: boolean
  }
}

type WithContentHashResult = {
  contentHash: InternalGetContentHashReturnType
}

type WithAbiResult = {
  abi: InternalGetAbiReturnType
}

type WithTextsResult = {
  texts: DecodedText[]
}

type WithCoinsResult = {
  coins: DecodedAddr[]
}

type BaseGetRecordsReturnType = Partial<
  WithContentHashResult & WithAbiResult & WithTextsResult & WithCoinsResult
> & { resolverAddress: Address }

export type GetRecordsReturnType<
  TParams extends GetRecordsParameters = GetRecordsParameters,
> = Prettify<
  TParams['records'] extends undefined
    ? BaseGetRecordsReturnType
    : (TParams['records']['contentHash'] extends true
        ? WithContentHashResult
        : {}) &
        (TParams['records']['abi'] extends true ? WithAbiResult : {}) &
        (TParams['records']['texts'] extends string[] ? WithTextsResult : {}) &
        (TParams['records']['coins'] extends (string | number)[]
          ? WithCoinsResult
          : {}) & { resolverAddress: Address }
>

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
    abi: resolveArraySnippet,
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
      abi: resolveArraySnippet,
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
            [{ type: 'bytes' }],
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

interface GeneratedGetRecordsFunction
  extends GeneratedFunction<EncoderFunction, DecoderFunction> {
  <TParams extends GetRecordsParameters>(
    client: ClientWithEns,
    args: TParams,
  ): Promise<GetRecordsReturnType<TParams>>
  // eslint-disable-next-line prettier/prettier
  batch: <TParams extends GetRecordsParameters>(
    args: TParams,
  ) => {
    args: [TParams]
    encode: EncoderFunction
    decode: typeof decode<TParams>
  }
}

const getRecords = generateFunction<
  EncoderFunction,
  DecoderFunction,
  GeneratedGetRecordsFunction
>({ encode, decode })

export default getRecords
