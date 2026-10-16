import {
  type ByteArray,
  type BytesToHexErrorType,
  bytesToHex,
  type Keccak256ErrorType,
  keccak256,
} from 'viem'
import { InvalidDnsEncodedNameError } from '../../errors/utils.js'
import { type EncodeLabelhashErrorType, encodeLabelhash } from './labels.js'

// ================================
// Bytes To Packet
// ================================

export type BytesToPacketErrorType =
  | InvalidDnsEncodedNameError
  | BytesToHexErrorType
  | Keccak256ErrorType
  | EncodeLabelhashErrorType

// ignoreBOM: keep a leading U+FEFF instead of stripping it
const decoder = new TextDecoder('utf-8', { ignoreBOM: true })

/**
 * Decodes a DNS-encoded name. Labels containing `.`, `[`, `]` or U+FFFD
 * (what invalid UTF-8 decodes to) are returned as encoded labelhashes.
 *
 * @throws {BytesToPacketErrorType}
 */
export function bytesToPacket(bytes: ByteArray): string {
  const labels: string[] = []
  let offset = 0
  for (let len = bytes[offset]; len; len = bytes[offset]) {
    const label = bytes.subarray(offset + 1, offset + 1 + len)
    const text = decoder.decode(label)
    labels.push(
      /[.[\]\uFFFD]/.test(text) ? encodeLabelhash(keccak256(label)) : text,
    )
    offset += 1 + len
  }
  if (offset !== bytes.length - 1)
    throw new InvalidDnsEncodedNameError({ bytes: bytesToHex(bytes) })
  return labels.join('.')
}
