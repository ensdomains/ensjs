import { describe, expect, it } from 'vitest'
import { getNameType } from './getNameType.js'

describe('getNameType', () => {
  it('returns root for the empty string', () => {
    expect(getNameType('')).toBe('root')
  })
  it('returns eth-tld for eth', () => {
    expect(getNameType('eth')).toBe('eth-tld')
  })
  it('returns eth-2ld for vitalik.eth', () => {
    expect(getNameType('vitalik.eth')).toBe('eth-2ld')
  })
  it('returns eth-subname for sub.vitalik.eth', () => {
    expect(getNameType('sub.vitalik.eth')).toBe('eth-subname')
  })
  it('returns tld for xyz', () => {
    expect(getNameType('xyz')).toBe('tld')
  })
  it('returns other-2ld for foo.xyz', () => {
    expect(getNameType('foo.xyz')).toBe('other-2ld')
  })
  it('returns other-subname for sub.foo.xyz', () => {
    expect(getNameType('sub.foo.xyz')).toBe('other-subname')
  })
})
