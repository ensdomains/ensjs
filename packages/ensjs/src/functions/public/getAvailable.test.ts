import { describe, expect, it } from 'vitest'
import { publicClient } from '../../test/addTestContracts.js'
import getAvailable from './getAvailable.js'

describe('getAvailable', () => {
  it('should return false for a name that is unavailable', async () => {
    const result = await getAvailable(publicClient, { name: 'test123.eth' })
    expect(typeof result).toBe('boolean')
    expect(result).toBe(false)
  })
  it('should return true for a name that is available', async () => {
    const result = await getAvailable(publicClient, {
      name: 'available-name.eth',
    })
    expect(typeof result).toBe('boolean')
    expect(result).toBe(true)
  })
  it('normalises the label before hashing, so a non-normalised name checks the canonical id', () => {
    // 😠️ carries a U+FE0F variation selector that ENSIP-15 normalisation
    // strips. Before the fix, the raw label hashed to a different tokenId than
    // the canonical 😠.eth, so `available` was checked against the wrong id.
    // Both forms must now produce identical availability calldata.
    const withVariationSelector = getAvailable.encode(publicClient, {
      name: '😠️.eth',
    })
    const normalised = getAvailable.encode(publicClient, { name: '😠.eth' })
    expect(withVariationSelector.data).toEqual(normalised.data)
  })
})
