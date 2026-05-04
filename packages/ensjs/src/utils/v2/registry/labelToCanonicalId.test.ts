import { labelhash } from 'viem'
import { describe, expect, it } from 'vitest'
import { labelToCanonicalId } from './labelToCanonicalId.js'

describe('labelToCanonicalId', () => {
  it('zeroes out the low 32 bits of the labelhash', () => {
    const id = labelToCanonicalId('test')
    // low 32 bits should be zero
    expect(id & 0xffffffffn).toBe(0n)
  })

  it('preserves the upper bits of the labelhash', () => {
    const id = labelToCanonicalId('test')
    const full = BigInt(labelhash('test'))
    // XOR with low32 zeroes them, so id should equal full with low 32 bits cleared
    expect(id).toBe(full ^ (full & 0xffffffffn))
  })

  it('returns different ids for different labels', () => {
    const a = labelToCanonicalId('foo')
    const b = labelToCanonicalId('bar')
    expect(a).not.toBe(b)
  })
})
