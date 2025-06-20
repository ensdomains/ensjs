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
        "decoded": "bafybeico3uuyj3vphxpvbowchdwjlrlrh62awxscrnii7w7flu5z6fk77y",
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
    await expect(
      getContentHashRecord(publicClient, {
        name: 'thisnamedoesnotexist.eth',
        strict: true,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "resolve" reverted.

      Error: ResolverWildcardNotSupported()
       
      Contract Call:
        address:   0x5eb3Bc0a489C5A8288765d2336659EbCA68FCd00
        function:  resolve(bytes name, bytes data)
        args:             (0x14746869736e616d65646f65736e6f7465786973740365746800, 0xbc1c58d1287cee1ffaaa678d79079ce4ecc357370874e29f72642e32beaf9bc904adf20e)

      Version: viem@2.30.6]
    `)
  })
})
