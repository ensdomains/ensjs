import { RawContractError, bytesToHex, encodeErrorResult } from 'viem'
import { describe, expect, it } from 'vitest'
import type { ClientWithEns } from '../../contracts/consts.js'
import { universalResolverErrors } from '../../contracts/universalResolver.js'
import { publicClient } from '../../test/addTestContracts.js'
import { packetToBytes } from '../../utils/hexEncodedName.js'
import getContentHashRecord from './getContentHashRecord.js'

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
    await expect(
      getContentHashRecord.decode(
        {} as ClientWithEns,
        new RawContractError({
          data: '0x77209fe8', // ResolverNotFound()
        }),
        {
          address: '0x1234567890abcdef',
          args: ['0x', '0x'],
        },
        { strict: false },
      ),
    ).resolves.toBeNull()
  })
  it('should throw on error when strict is true', async () => {
    await expect(
      getContentHashRecord.decode(
        {} as ClientWithEns,
        new RawContractError({
          data: encodeErrorResult({
            abi: universalResolverErrors,
            errorName: 'ResolverNotFound',
            args: [bytesToHex(packetToBytes('test.eth'))],
          }),
        }),
        {
          address: '0x1234567890abcdef',
          args: ['0x', '0x'],
        },

        { strict: true },
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "resolve" reverted.

      Error: ResolverNotFound(bytes name)
                             (0x04746573740365746800)
       
      Contract Call:
        address:   0x1234567890abcdef
        function:  resolve(bytes name, bytes data)
        args:             (0x, 0x)

      Version: viem@2.30.6]
    `)
  })
})
