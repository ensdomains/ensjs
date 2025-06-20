// Adapted from https://github.com/mafintosh/dns-packet
import {
  type ByteArray,
  type BytesToStringErrorType,
  bytesToString,
} from 'viem'

// ================================
// Bytes To Packet
// ================================

export type BytesToPacketErrorType = BytesToStringErrorType

/**
 * @throws {BytesToPacketErrorType}
 */
export function bytesToPacket(bytes: ByteArray): string {
  let offset = 0
  let result = ''

  while (offset < bytes.length) {
    const len = bytes[offset]
    if (len === 0) {
      offset += 1
      break
    }

    result += `${bytesToString(bytes.subarray(offset + 1, offset + len + 1))}.`
    offset += len + 1
  }

  return result.replace(/\.$/, '')
}
