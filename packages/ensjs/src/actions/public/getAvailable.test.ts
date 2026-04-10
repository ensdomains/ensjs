import { describe, expect, it } from 'vitest'
import { publicClient as publicClientL2 } from '../../test/addTestContracts.js'
import { getAvailable } from './getAvailable.js'

describe('getAvailable', () => {
  it('should return false for a name that is unavailable', async () => {
    // 'test' is pre-seeded by the devnet's --testNames
    const result = await getAvailable(publicClientL2, { name: 'test.eth' })
    expect(typeof result).toBe('boolean')
    expect(result).toBe(false)
  })
  it('should return true for a name that is available', async () => {
    const result = await getAvailable(publicClientL2, {
      name: 'available-name.eth',
    })
    expect(typeof result).toBe('boolean')
    expect(result).toBe(true)
  })
})
