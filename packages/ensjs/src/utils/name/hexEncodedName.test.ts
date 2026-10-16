import {
  concat,
  type Hex,
  hexToBytes,
  keccak256,
  namehash,
  stringToBytes,
  zeroHash,
} from 'viem'
import { packetToBytes } from 'viem/ens'
import { describe, expect, it } from 'vitest'
import { InvalidDnsEncodedNameError } from '../../errors/utils.js'
import { bytesToPacket } from './hexEncodedName.js'

// DNS-encodes raw labels and namehashes them over their raw bytes
const encode = (...labels: (string | Uint8Array)[]) => {
  const raw = labels.map((l) => (typeof l === 'string' ? stringToBytes(l) : l))
  return {
    bytes: concat([
      ...raw.flatMap((l) => [Uint8Array.of(l.length), l]),
      Uint8Array.of(0),
    ]),
    node: raw.reduceRight<Hex>(
      (node, l) => keccak256(concat([node, keccak256(l)])),
      zeroHash,
    ),
  }
}

describe('bytesToPacket', () => {
  it.each(['', 'eth', 'test.eth', 'sub.test.eth', '💩.eth', 'Ünïcödé.eth'])(
    'decodes %j',
    (name) => {
      expect(bytesToPacket(packetToBytes(name))).toBe(name)
    },
  )

  it('reads a 255-byte label as a length, not a compression pointer', () => {
    const name = `${'a'.repeat(255)}.eth`
    expect(bytesToPacket(packetToBytes(name))).toBe(name)
  })

  it('encodes a label containing a dot as its labelhash (#222)', () => {
    const name = bytesToPacket(encode('8436.eth', 'eth').bytes)
    expect(name).toBe(
      '[fb1d24d5dc41613d5b4874e6cccb06ecf442f6f1773c3771c4fcce1161985a18].eth',
    )
    // NameWrapper's node for these bytes on mainnet
    expect(namehash(name)).toBe(
      '0x19a2c81ceaecdd40aa03e760f30aa3f087a534f87c68038cc518742e4949131d',
    )
  })

  it.each([
    ['a label shaped like an encoded labelhash', `[${'ab'.repeat(32)}]`],
    ['a stray bracket', 'a]b'],
    ['invalid UTF-8', Uint8Array.of(0xff)],
    ['a literal U+FFFD', '\uFFFD'],
  ])('encodes %s as its labelhash', (_, label) => {
    const { bytes, node } = encode(label, 'eth')
    const name = bytesToPacket(bytes)
    expect(name).toMatch(/^\[[0-9a-f]{64}\]\.eth$/)
    expect(namehash(name)).toBe(node)
  })

  it('keeps a leading byte order mark', () => {
    const { bytes, node } = encode('\uFEFFa', 'eth')
    expect(bytesToPacket(bytes)).toBe('\uFEFFa.eth')
    expect(namehash('\uFEFFa.eth')).toBe(node)
  })

  it('namehashes every single-byte label to the node the bytes encode', () => {
    for (let byte = 1; byte < 256; byte++) {
      const { bytes, node } = encode(Uint8Array.of(byte), 'eth')
      expect(namehash(bytesToPacket(bytes))).toBe(node)
    }
  })

  it.each([
    ['empty input', '0x'],
    ['a missing terminator', '0x0474657374'],
    ['a label running past the end', '0x0a7465737400'],
    ['trailing data', '0x04746573740000'],
  ] as const)('throws on %s', (_, hex) => {
    expect(() => bytesToPacket(hexToBytes(hex))).toThrow(
      InvalidDnsEncodedNameError,
    )
  })
})
