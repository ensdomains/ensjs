import { assert, describe, expect, it } from 'vitest'
import { publicClient } from '../../test/addTestContracts.js'
import { generateSupportedContentTypes } from '../../utils/generateSupportedContentTypes.js'
import { getAbiRecord } from './getAbiRecord.js'

const dummyABI = [
  {
    type: 'event',
    anonymous: false,
    name: 'ABIChanged',
    inputs: [
      {
        type: 'bytes32',
        indexed: true,
      },
      {
        type: 'uint256',
        indexed: true,
      },
    ],
  },
  {
    type: 'event',
    anonymous: false,
    name: 'VersionChanged',
    inputs: [
      {
        type: 'bytes32',
        indexed: true,
      },
      {
        type: 'uint64',
      },
    ],
  },
  {
    type: 'function',
    name: 'ABI',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'bytes32',
      },
      {
        type: 'uint256',
      },
    ],
    outputs: [
      {
        type: 'uint256',
      },
      {
        type: 'bytes',
      },
    ],
  },
  {
    type: 'function',
    name: 'clearRecords',
    constant: false,
    payable: false,
    inputs: [
      {
        type: 'bytes32',
      },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'recordVersions',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'bytes32',
      },
    ],
    outputs: [
      {
        type: 'uint64',
      },
    ],
  },
  {
    type: 'function',
    name: 'setABI',
    constant: false,
    payable: false,
    inputs: [
      {
        type: 'bytes32',
      },
      {
        type: 'uint256',
      },
      {
        type: 'bytes',
      },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'supportsInterface',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'bytes4',
      },
    ],
    outputs: [
      {
        type: 'bool',
      },
    ],
  },
]

describe('getAbiRecord()', () => {
  it('should return object for type 1 abi', async () => {
    const result = await getAbiRecord(publicClient, {
      name: 'with-type-1-abi.eth',
    })
    assert.isNotNull(result)
    expect(result.contentType).toBe(1)
    expect(result.decoded).toBe(true)
    expect(result.abi).toMatchObject(dummyABI)
  })
  it('should return object for type 2 ABI', async () => {
    const result = await getAbiRecord(publicClient, {
      name: 'with-type-2-abi.eth',
    })
    assert.isNotNull(result)
    expect(result.contentType).toBe(2)
    expect(result.decoded).toBe(true)
    expect(result.abi).toMatchObject(dummyABI)
  })
  it('should return object for type 4 ABI', async () => {
    const result = await getAbiRecord(publicClient, {
      name: 'with-type-4-abi.eth',
    })
    assert.isNotNull(result)
    expect(result.contentType).toBe(4)
    expect(result.decoded).toBe(true)
    expect(result.abi).toMatchObject(dummyABI)
  })
  it('should return unresolved URI for type 8 ABI', async () => {
    const result = await getAbiRecord(publicClient, {
      name: 'with-type-8-abi.eth',
    })
    assert.isNotNull(result)
    expect(result.contentType).toBe(8)
    expect(result.decoded).toBe(true)
    expect(result.abi).toBe('https://example.com')
  })
  it('should return null if unsupported contentType (returned as 0x from contract)', async () => {
    const result = await getAbiRecord(publicClient, {
      name: 'with-type-256-abi.eth',
    })
    expect(result).toBeNull()
  })
  it('should return the result of type 1 abi if the name has multiple abi records', async () => {
    const result = await getAbiRecord(publicClient, {
      name: 'with-type-all-abi.eth',
    })
    assert.isNotNull(result)
    expect(result.contentType).toBe(1)
    expect(result.decoded).toBe(true)
    expect(result.abi).toMatchObject(dummyABI)
  })
  it('should return the result of type 2 abi if supportedContentTypes is zlib', async () => {
    const result = await getAbiRecord(publicClient, {
      name: 'with-type-all-abi.eth',
      supportedContentTypes: generateSupportedContentTypes('zlib'),
    })
    assert.isNotNull(result)
    expect(result.contentType).toBe(2)
    expect(result.decoded).toBe(true)
    expect(result.abi).toMatchObject(dummyABI)
  })
  it('should return the result of type 4 abi if supportedContentTypes is cbor', async () => {
    const result = await getAbiRecord(publicClient, {
      name: 'with-type-all-abi.eth',
      supportedContentTypes: generateSupportedContentTypes('cbor'),
    })
    assert.isNotNull(result)
    expect(result.contentType).toBe(4)
    expect(result.decoded).toBe(true)
    expect(result.abi).toMatchObject(dummyABI)
  })
  it('should return the result of type 8 abi if supportedContentTypes is uri', async () => {
    const result = await getAbiRecord(publicClient, {
      name: 'with-type-all-abi.eth',
      supportedContentTypes: generateSupportedContentTypes('uri'),
    })
    assert.isNotNull(result)
    expect(result.contentType).toBe(8)
    expect(result.decoded).toBe(true)
    expect(result.abi).toBe('https://example.com')
  })
  it('should return null on error when strict is false', async () => {
    const result = await getAbiRecord(publicClient, {
      name: 'thisnamedoesnotexist.eth',
    })
    expect(result).toBeNull()
  })
  it('should throw on error when strict is true', async () => {
    await expect(
      getAbiRecord(publicClient, {
        name: 'thisnamedoesnotexist.eth',
        strict: true,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "resolve" reverted.

      Error: ResolverNotFound(bytes name)
                             (0x14746869736e616d65646f65736e6f7465786973740365746800)

      Contract Call:
        address:   0x82e01223d51Eb87e16A03E24687EDF0F294da6f1
        function:  resolve(bytes name, bytes data)
        args:             (0x14746869736e616d65646f65736e6f7465786973740365746800, 0x2203ab56287cee1ffaaa678d79079ce4ecc357370874e29f72642e32beaf9bc904adf20e000000000000000000000000000000000000000000000000000000000000000f)

      Docs: https://viem.sh/docs/contract/readContract
      Version: viem@2.38.3]
    `)
  })
})
