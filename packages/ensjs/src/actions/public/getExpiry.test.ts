import { assert, describe, expect, it } from 'vitest'
import { publicClient } from '../../test/addTestContracts.js'
import { getExpiry } from './getExpiry.js'

describe('getExpiry', () => {
  it('should get the expiry for a .eth name with no other args', async () => {
    const result = await getExpiry(publicClient, { name: 'with-profile.eth' })
    assert.isNotNull(result)
    expect(result?.expiry).toBeTypeOf('bigint')
    expect(result?.gracePeriod).toBe(7776000)
    expect(result?.status).toBe('active')
  })
  it('should get the expiry for a wrapped name', async () => {
    const result = await getExpiry(publicClient, {
      name: 'wrapped.eth',
      contract: 'nameWrapper',
    })

    assert.isNotNull(result)
    expect(result?.expiry).toBeTypeOf('bigint')
    expect(result?.gracePeriod).toBe(0)
    expect(result?.status).toBe('active')
  })
  it('should return null for a non .eth name if not wrapped', async () => {
    const result = await getExpiry(publicClient, {
      name: 'sub.with-profile.eth',
    })
    expect(result).toBeNull()
  })
  it('should throw an error for a non .eth name if registrar is specified', async () => {
    await expect(
      getExpiry(publicClient, {
        name: 'sub.with-profile.eth',
        contract: 'registrar',
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [UnsupportedNameTypeError: Unsupported name type: eth-subname

      - Supported name types: eth-2ld, tld

      Details: Only the expiry of eth-2ld names can be fetched when using the registrar contract

      Version: @ensdomains/ensjs@1.0.0-mock.0]
    `)
  })
  it('should get the expiry for a .eth name using l2Registrar contract', async () => {
    const result = await getExpiry(publicClient, {
      name: 'with-profile.eth',
      contract: 'l2Registrar',
    })
    assert.isNotNull(result)
    expect(result?.expiry).toBeTypeOf('bigint')
    expect(result?.gracePeriod).toBeTypeOf('number')
    expect(result?.status).toBe('active')
  })
})
