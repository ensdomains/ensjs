import { describe, expect, it } from 'vitest'
import { UnsupportedNameTypeError } from '../../../errors/general.js'
import { publicClient as publicClientL2 } from '../../../test/addTestContracts.js'
import { getAvailable } from './getAvailable.js'

describe('getAvailable', () => {
  describe('eth-2ld', () => {
    it('should return false for a registered name', async () => {
      // `test.eth` is registered by the devnet's --testNames
      const result = await getAvailable(publicClientL2, { name: 'test.eth' })
      expect(result).toBe(false)
    })

    it('should return true for an unregistered name', async () => {
      const result = await getAvailable(publicClientL2, {
        name: 'available-name.eth',
      })
      expect(result).toBe(true)
    })

    it('should return false for a RESERVED name', async () => {
      // `reserved.eth` is reserved (no owner, no token) by the devnet.
      // The registrar's isAvailable must treat reserved names as unavailable.
      const result = await getAvailable(publicClientL2, {
        name: 'reserved.eth',
      })
      expect(result).toBe(false)
    })
  })

  describe('eth-subname (3LD and beyond)', () => {
    it('should return false for a registered subname', async () => {
      const result = await getAvailable(publicClientL2, {
        name: 'sub2.parent.eth',
      })
      expect(result).toBe(false)
    })

    it('should return true for an available subname', async () => {
      const result = await getAvailable(publicClientL2, {
        name: 'definitely-available-sub.parent.eth',
      })
      expect(result).toBe(true)
    })

    it('should return false for a registered 3LD (sub1.sub2.parent.eth)', async () => {
      const result = await getAvailable(publicClientL2, {
        name: 'sub1.sub2.parent.eth',
      })
      expect(result).toBe(false)
    })

    it('should return false for a registered 4LD (wallet.sub1.sub2.parent.eth)', async () => {
      const result = await getAvailable(publicClientL2, {
        name: 'wallet.sub1.sub2.parent.eth',
      })
      expect(result).toBe(false)
    })

    it('should return true for a deep available subname under an existing parent', async () => {
      // `available.sub1.sub2.parent.eth` is not registered, but its parent
      // registry (sub1.sub2.parent.eth) exists.
      const result = await getAvailable(publicClientL2, {
        name: 'available.sub1.sub2.parent.eth',
      })
      expect(result).toBe(true)
    })

    it('should return true for a subname under a parent with no subregistry', async () => {
      // `test.eth` has no subregistry, so any subname under it is available.
      const result = await getAvailable(publicClientL2, {
        name: 'anything.test.eth',
      })
      expect(result).toBe(true)
    })
  })

  it('should throw for unsupported name types', async () => {
    // DNS 2LD, DNS subname, eth tld, non-eth tld, and root
    for (const name of ['example.com', 'sub.example.com', 'eth', 'com', '']) {
      await expect(getAvailable(publicClientL2, { name })).rejects.toThrowError(
        UnsupportedNameTypeError,
      )
    }
  })
})
