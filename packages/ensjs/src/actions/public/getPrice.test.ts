import { describe, expect, it } from 'vitest'
import { publicClient as publicClientL2 } from '../../test/addTestContracts.js'
import { getPrice } from './getPrice.js'

describe('getPrice', () => {
  it('should return a base and premium price for a name', async () => {
    const result = await getPrice(publicClientL2, {
      nameOrNames: 'test123.eth',
      duration: 86400,
    })
    expect(result).toBeTruthy()
    expect(result.base).toBeGreaterThan(0n)
    expect(result.premium).toBe(0n)
  })

  it('should return a base and premium price for an array of names', async () => {
    const result = await getPrice(publicClientL2, {
      nameOrNames: ['test123.eth', 'another.eth'],
      duration: 86400,
    })
    expect(result).toBeTruthy()
    expect(result.base).toBeGreaterThan(0n)
    expect(result.premium).toBe(0n)
  })

  it('should allow labels as inputs', async () => {
    const result = await getPrice(publicClientL2, {
      nameOrNames: 'test123',
      duration: 86400,
    })
    expect(result).toBeTruthy()
    expect(result.base).toBeGreaterThan(0n)
    expect(result.premium).toBe(0n)
  })
})
