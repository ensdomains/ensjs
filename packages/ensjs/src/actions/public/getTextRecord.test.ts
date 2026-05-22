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
    await expect(
      getTextRecord(publicClient, {
        name: 'thisnamedoesnotexist.eth',
        key: 'description',
        strict: true,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "resolve" reverted.

      Error: ResolverError(bytes errorData)
                          (0x5fe9a5df0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001a14746869736e616d65646f65736e6f7465786973740365746800000000000000)
       
      Contract Call:
        address:   0xAA292E8611aDF267e563f334Ee42320aC96D0463
        function:  resolve(bytes name, bytes data)
        args:             (0x14746869736e616d65646f65736e6f7465786973740365746800, 0x59d1d43c287cee1ffaaa678d79079ce4ecc357370874e29f72642e32beaf9bc904adf20e0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000b6465736372697074696f6e000000000000000000000000000000000000000000)

      Docs: https://viem.sh/docs/contract/readContract
      Details: execution reverted: custom error 0x95c0c752: 000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000645fe9a5df0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001a14746869736e616d65646f65736e6f746578697374036574680000000000000000000000000000000000000000000000000000000000000000000000
      Version: viem@2.47.10]
    `)
  })
})
