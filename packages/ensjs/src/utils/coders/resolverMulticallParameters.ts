import type { Hex } from 'viem'
import type { Prettify } from '../../types/index.js'
import {
  type ClearRecordsParametersErrorType,
  type ClearRecordsParametersReturnType,
  clearRecordsParameters,
} from './clearRecords.js'
import type { EncodeAbiParameters } from './encodeAbi.js'
import {
  type SetAbiParametersErrorType,
  type SetAbiParametersReturnType,
  setAbiParameters,
} from './setAbi.js'
import {
  type SetAddrParametersErrorType,
  type SetAddrParametersParameters,
  type SetAddrParametersReturnType,
  setAddrParameters,
} from './setAddr.js'
import {
  type SetContentHashParametersErrorType,
  type SetContentHashParametersReturnType,
  setContentHashParameters,
} from './setContentHash.js'
import {
  type SetTextParameters,
  type SetTextParametersErrorType,
  type SetTextParametersReturnType,
  setTextParameters,
} from './setText.js'

export type RecordOptions = Prettify<{
  /** Clears all current records */
  clearRecords?: boolean
  /** ContentHash value */
  contentHash?: string | null
  /** Array of text records */
  texts?: Omit<SetTextParameters, 'namehash'>[]
  /** Array of coin records */
  coins?: Omit<SetAddrParametersParameters, 'namehash'>[]
  /** ABI value */
  abi?: EncodeAbiParameters | EncodeAbiParameters[]
}>

export type ResolverMulticallItem =
  | ClearRecordsParametersReturnType
  | SetContentHashParametersReturnType
  | SetAbiParametersReturnType
  | SetTextParametersReturnType
  | SetAddrParametersReturnType

// ================================
// Resolver multicall item
// ================================

export type ResolverMulticallParametersReturnType = ResolverMulticallItem[]

export type ResolverMulticallItemErrorType =
  | ClearRecordsParametersErrorType
  | SetContentHashParametersErrorType
  | SetAbiParametersErrorType
  | SetTextParametersErrorType
  | SetAddrParametersErrorType

export const resolverMulticallParameters = async ({
  namehash,
  clearRecords,
  contentHash,
  texts,
  coins,
  abi,
}: {
  namehash: Hex
} & RecordOptions): Promise<ResolverMulticallParametersReturnType> => {
  const calls: ResolverMulticallParametersReturnType = []

  if (clearRecords) {
    calls.push(clearRecordsParameters(namehash))
  }

  if (contentHash !== undefined) {
    const data = setContentHashParameters({ namehash, contentHash })
    if (data) calls.push(data)
  }

  if (abi !== undefined) {
    const abis = Array.isArray(abi) ? abi : [abi]
    const data = await Promise.all(
      abis.map(async (abiItem) => setAbiParameters({ namehash, ...abiItem })),
    )
    if (data) calls.push(...data)
  }

  if (texts && texts.length > 0) {
    const data = texts.map((textItem) =>
      setTextParameters({ namehash, ...textItem }),
    )
    if (data) calls.push(...data)
  }

  if (coins && coins.length > 0) {
    const data = coins.map((coinItem) =>
      setAddrParameters({ namehash, ...coinItem }),
    )
    if (data) calls.push(...data)
  }

  return calls
}
