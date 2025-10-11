import { describe, it, expect } from 'vitest'
import { bytesToPacket } from './hexEncodedName.js'
import { hexToBytes } from 'viem'

describe('bytesToPacket', () => {
  it('should decode 08383433362E6574680365746800 to 8436.eth', () => {
    const bytes = hexToBytes('0x08383433362E6574680365746800')
    expect(bytesToPacket(bytes)).toBe('8436.eth')
  })
  it('should not append .eth if already present', () => {
    const bytes = hexToBytes('0x04746573740365746800') // test.eth
    expect(bytesToPacket(bytes)).toBe('test.eth')
  })
})
