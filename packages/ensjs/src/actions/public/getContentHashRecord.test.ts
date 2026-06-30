import { describe, expect, it } from 'vitest'
import { publicClient } from '../../test/addTestContracts.js'
import { getContentHashRecord } from './getContentHashRecord.js'

describe('getContentHashRecord', () => {
  it('should return null for a non-existent name', async () => {
    const result = await getContentHashRecord(publicClient, {
      name: 'test123123cool.eth',
    })
    expect(result).toBeNull()
  })
  it('should return null for a name with no contenthash record', async () => {
    const result = await getContentHashRecord(publicClient, {
      name: 'with-profile.eth',
    })
    expect(result).toBeNull()
  })
  it('should return the contenthash for a name with the record set', async () => {
    const result = await getContentHashRecord(publicClient, {
      name: 'with-contenthash.eth',
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "decoded": "bafybeiac5y4sk47yumr2xxqmaryqs4pszld2r2yaxeru666yf6pgmtv77q",
        "protocolType": "ipfs",
      }
    `)
  })
  it('should return null on error when strict is false', async () => {
    const result = await getContentHashRecord(publicClient, {
      name: 'thisnamedoesnotexist.eth',
      strict: false,
    })
    expect(result).toBeNull()
  })
  it('should throw on error when strict is true', async () => {
    // The name is neither registered on v1 nor reserved on v2, so the Universal
    // Resolver reverts with ResolverNotFound; strict mode surfaces it.
    await expect(
      getContentHashRecord(publicClient, {
        name: 'thisnamedoesnotexist.eth',
        strict: true,
      }),
    ).rejects.toThrowError('ResolverNotFound')
  })
})
