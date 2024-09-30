import { type Hex } from 'viem'
import type { Prettify } from '../types.js'
import {./coders/encodeAbi.js
  encodeSetText,./coders/encodeClearRecords.js
  type EncodeSetTextParameters,
} from './coders/encodeSetText.js'
import type { EncodedAbi } from './encoders/encodeAbi.js'
import { encodeClearRecords } from './encoders/encodeClearRecords.js'
import {
  encodeSetAbi,
  type EncodeSetAbiParameters,
} from './coders/encodeSetAbi.js'
import {
  encodeSetAddr,
  type EncodeSetAddrParameters,
} from './coders/encodeSetAddr.js'
import { encodeSetContentHash } from './coders/encodeSetContentHash.js'

export type RecordOptions = Prettify<{
  /** Clears all current records */
  clearRecords?: boolean
  /** ContentHash value */
  contentHash?: string | null
  /** Array of text records */
  texts?: Omit<EncodeSetTextParameters, 'namehash'>[]
  /** Array of coin records */
  coins?: Omit<EncodeSetAddrParameters, 'namehash'>[]
  /** ABI value */
  abi?: EncodedAbi | EncodedAbi[]
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
    calls.push(encodeClearRecords(namehash))
  }

  if (contentHash !== undefined) {
    const data = encodeSetContentHash({ namehash, contentHash })
    if (data) calls.push(data)
  }

  if (abi !== undefined) {
    const abis = Array.isArray(abi) ? abi : [abi]
    for (const abi_ of abis) {
      const data = encodeSetAbi({ namehash, ...abi_ } as EncodeSetAbiParameters)
      if (data) calls.push(data)
    }
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
