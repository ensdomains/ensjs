import { maxUint256 } from 'viem'
import { describe, expect, it } from 'vitest'
import { randomProxySalt } from './randomProxySalt.js'

describe('randomProxySalt', () => {
  it('returns a different uint256 on every call', () => {
    const salts = Array.from({ length: 32 }, randomProxySalt)

    expect(new Set(salts).size).toBe(salts.length)
    for (const salt of salts) {
      expect(salt).toBeGreaterThanOrEqual(0n)
      expect(salt).toBeLessThanOrEqual(maxUint256)
    }
  })
})
