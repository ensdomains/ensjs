import {
  type BytesToHexErrorType,
  bytesToHex,
  type ConcatErrorType,
  concat,
  type Hex,
  type HexToBytesErrorType,
  hexToBytes,
  type Keccak256ErrorType,
  keccak256,
  type StringToBytesErrorType,
  stringToBytes,
} from 'viem'
import {
  type DecodeLabelhashErrorType,
  decodeLabelhash,
  isEncodedLabelhash,
} from './labels.js'
import { normalize } from './normalize.js'

export type NamehashParameters = string

export type NamehashReturnType = Hex

export type NamehashErrorType =
  | BytesToHexErrorType
  | HexToBytesErrorType
  | DecodeLabelhashErrorType
  | Keccak256ErrorType
  | StringToBytesErrorType
  | ConcatErrorType

/**
 * Hashes a name
 *
 * @throws {NamehashErrorType}
 * @param name - Name to hash
 */
export function namehash(name: string): Hex {
  let result = new Uint8Array(32).fill(0)
  if (!name) return bytesToHex(result) // may throw BytesToHexErrorType

  const labels = name.split('.')
  // Iterate in reverse order building up hash
  for (let i = labels.length - 1; i >= 0; i -= 1) {
    let labelSha: Uint8Array
    if (isEncodedLabelhash(labels[i])) {
      labelSha = hexToBytes(
        // may throw HexToBytesErrorType
        decodeLabelhash(labels[i]), // may throw DecodeLabelhashErrorType
      )
    } else {
      const normalised = normalize(labels[i])
      labelSha = keccak256(
        // may throw Keccak256ErrorType
        stringToBytes(normalised), // may throw StringToBytesErrorType
        'bytes',
      )
    }
    result = keccak256(
      // may throw Keccak256ErrorType
      concat([result, labelSha]), // may throw ConcatErrorType
      'bytes',
    )
  }

  return bytesToHex(result) // may throw BytesToHexErrorType
}
