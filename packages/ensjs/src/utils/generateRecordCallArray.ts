import { Hex, encodeFunctionData } from 'viem'
import { clearRecordsSnippet } from '../contracts/publicResolver'
import { Prettify } from '../types'
import { EncodeSetAbiParameters, encodeSetAbi } from './encoders/encodeSetAbi'
import {
  EncodeSetAddrParameters,
  encodeSetAddr,
} from './encoders/encodeSetAddr'
import { encodeSetContentHash } from './encoders/encodeSetContentHash'
import {
  EncodeSetTextParameters,
  encodeSetText,
} from './encoders/encodeSetText'

export type RecordOptions = Prettify<{
  /** Clears all current records */
  clearRecords?: boolean
  /** ContentHash value */
  contentHash?: string
  /** Array of text records */
  texts?: Omit<EncodeSetTextParameters, 'namehash'>[]
  /** Array of coin records */
  coins?: Omit<EncodeSetAddrParameters, 'namehash'>[]
  /** ABI value */
  abi?: Omit<EncodeSetAbiParameters, 'namehash'>
}>

export const generateRecordCallArray = ({
  namehash,
  clearRecords,
  contentHash,
  texts,
  coins,
  abi,
}: { namehash: Hex } & RecordOptions): Hex[] => {
  const calls: Hex[] = []

  if (clearRecords) {
    calls.push(
      encodeFunctionData({
        abi: clearRecordsSnippet,
        functionName: 'clearRecords',
        args: [namehash],
      }),
    )
  }

  if (typeof contentHash === 'string') {
    const data = encodeSetContentHash({ namehash, contentHash })
    if (data) calls.push(data)
  }

  if (abi) {
    const data = encodeSetAbi({ namehash, ...abi } as EncodeSetAbiParameters)
    if (data) calls.push(data)
  }

  if (texts && texts.length > 0) {
    const data = texts.map((textItem) =>
      encodeSetText({ namehash, ...textItem }),
    )
    if (data) calls.push(...data)
  }

  if (coins && coins.length > 0) {
    const data = coins.map((coinItem) =>
      encodeSetAddr({ namehash, ...coinItem }),
    )
    if (data) calls.push(...data)
  }

  return calls
}
