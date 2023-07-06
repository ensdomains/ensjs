// Adapted from https://github.com/mafintosh/dns-packet
import { bytesToString, stringToBytes, type ByteArray } from 'viem'

/*
 * @description Encodes a DNS packet into a ByteArray containing a UDP payload.
 */
export function packetToBytes(packet: string): ByteArray {
  function length(value: string) {
    if (value === '.' || value === '..') return 1
    return stringToBytes(value.replace(/^\.|\.$/gm, '')).length + 2
  }

  const bytes = new Uint8Array(length(packet))
  // strip leading and trailing `.`
  const value = packet.replace(/^\.|\.$/gm, '')
  if (!value.length) return bytes

  let offset = 0
  const list = value.split('.')
  for (let i = 0; i < list.length; i += 1) {
    const encoded = stringToBytes(list[i])
    bytes[offset] = encoded.length
    bytes.set(encoded, offset + 1)
    offset += encoded.length + 1
  }

  return bytes
}

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
