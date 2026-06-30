import { describe, expect, it } from 'vitest'
import { publicClient } from '../../test/addTestContracts.js'
import { getTextRecord } from './getTextRecord.js'

describe('getTextRecord()', () => {
  it('should return a record from a key', async () => {
    const result = await getTextRecord(publicClient, {
      name: 'with-profile.eth',
      key: 'description',
    })
    expect(result).toBe('Hello2')
  })

  it('should return null for a non-existent key', async () => {
    const result = await getTextRecord(publicClient, {
      name: 'with-profile.eth',
      key: 'thiskeydoesntexist',
    })
    expect(result).toBeNull()
  })
  it('should return null on error when strict is false', async () => {
    const result = await getTextRecord(publicClient, {
      name: 'thisnamedoesnotexist.eth',
      key: 'description',
    })
    expect(result).toBeNull()
  })
  it('should throw on error when strict is true', async () => {
    // The name is neither registered on v1 nor reserved on v2, so the Universal
    // Resolver reverts with ResolverNotFound; strict mode surfaces it.
    await expect(
      getTextRecord(publicClient, {
        name: 'thisnamedoesnotexist.eth',
        key: 'description',
        strict: true,
      }),
    ).rejects.toThrowError('ResolverNotFound')
  })
})
