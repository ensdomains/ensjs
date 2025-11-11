import { describe, expect, it } from 'vitest'
import { getNameType } from './getNameType'

describe('getNameType', () => {
  it('should return "tld" for empty string', () => {
    expect(getNameType('')).toBe('tld')
  })

  it('should return "tld" for a non-eth top-level domain', () => {
    expect(getNameType('com')).toBe('tld')
  })

  it('should return "eth-tld" for eth top-level domain', () => {
    expect(getNameType('eth')).toBe('eth-tld')
  })

  it('should return "other-2ld" for a non-eth second-level domain', () => {
    expect(getNameType('example.com')).toBe('other-2ld')
  })

  it('should return "eth-2ld" for eth second-level domain', () => {
    expect(getNameType('example.eth')).toBe('eth-2ld')
  })

  it('should return "other-subname" for a non-eth subname', () => {
    expect(getNameType('sub.example.com')).toBe('other-subname')
  })

  it('should return "eth-subname" for eth subname', () => {
    expect(getNameType('sub.example.eth')).toBe('eth-subname')
  })
})
