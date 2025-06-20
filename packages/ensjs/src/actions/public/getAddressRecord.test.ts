import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { describe, expect, it } from 'vitest'
import { addEnsContracts } from '../../contracts/addEnsContracts.js'
import { publicClient } from '../../test/addTestContracts.js'
import { getAddressRecord } from './getAddressRecord.js'

const mainnetPublicClient = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http('https://mainnet.gateway.tenderly.co/4imxc4hQfRjxrVB2kWKvTo'),
})

describe('getAddressRecord()', () => {
  it('returns the ETH record when no coin is provided', async () => {
    const result = await getAddressRecord(publicClient, {
      name: 'with-profile.eth',
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "coinType": 60,
        "symbol": "eth",
        "value": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      }
    `)
  })
  it('should return the correct address based on a coin ID input as a number', async () => {
    const result = await getAddressRecord(publicClient, {
      name: 'with-profile.eth',
      coin: 61,
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "coinType": 61,
        "symbol": "etcLegacy",
        "value": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      }
    `)
  })
  it('should return the correct address based on a coin ID input as a string', async () => {
    const result = await getAddressRecord(publicClient, {
      name: 'with-profile.eth',
      coin: '61',
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "coinType": 61,
        "symbol": "etcLegacy",
        "value": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      }
    `)
  })
  it('should return the correct address based on a coin name', async () => {
    const result = await getAddressRecord(publicClient, {
      name: 'with-profile.eth',
      coin: 'etcLegacy',
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "coinType": 61,
        "symbol": "etcLegacy",
        "value": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      }
    `)
  })
  it('should return null for a non-existent coin', async () => {
    const result = await getAddressRecord(publicClient, {
      name: 'with-profile.eth',
      coin: 'BNB',
    })
    expect(result).toBeNull()
  })
  it('should return value for label > 255 bytes', async () => {
    const result = await getAddressRecord(mainnetPublicClient, {
      name: '696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969.eth',
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "coinType": 60,
        "symbol": "eth",
        "value": "0xde9ba5F62D6047C4a9cCF24455AA733cCC5B8F41",
      }
    `)
  })
  it('should return null on error when strict is false', async () => {
    const result = await getAddressRecord(publicClient, {
      name: 'thisnamedoesnotexist.eth',
    })
    expect(result).toBeNull()
  })
  it('should throw on error when strict is true', async () => {
    await expect(
      getAddressRecord(publicClient, {
        name: 'thisnamedoesnotexist.eth',
        strict: true,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "resolve" reverted.

      Error: ResolverWildcardNotSupported()
       
      Contract Call:
        address:   0x5eb3Bc0a489C5A8288765d2336659EbCA68FCd00
        function:  resolve(bytes name, bytes data)
        args:             (0x14746869736e616d65646f65736e6f7465786973740365746800, 0x3b3b57de287cee1ffaaa678d79079ce4ecc357370874e29f72642e32beaf9bc904adf20e)

      Version: viem@2.30.6]
    `)
  })
})
