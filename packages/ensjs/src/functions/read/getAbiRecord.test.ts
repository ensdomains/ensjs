import { publicClient } from '../../tests/addTestContracts'
import getAbiRecord from './getAbiRecord'

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
    expect(result).toBeTruthy()
    if (result) {
      expect(result.contentType).toBe(1)
      expect(result.decoded).toBe(true)
      expect(result.abi).toMatchObject(dummyABI)
    }
  })
  it('should return object for type 2 ABI', async () => {
    const result = await getAbiRecord(publicClient, {
      name: 'with-type-2-abi.eth',
    })
    expect(result).toBeTruthy()
    if (result) {
      expect(result.contentType).toBe(2)
      expect(result.decoded).toBe(true)
      expect(result.abi).toMatchObject(dummyABI)
    }
  })
  it('should return object for type 4 ABI', async () => {
    const result = await getAbiRecord(publicClient, {
      name: 'with-type-4-abi.eth',
    })
    expect(result).toBeTruthy()
    if (result) {
      expect(result.contentType).toBe(4)
      expect(result.decoded).toBe(true)
      expect(result.abi).toMatchObject(dummyABI)
    }
  })
  it('should return unresolved URI for type 8 ABI', async () => {
    const result = await getAbiRecord(publicClient, {
      name: 'with-type-8-abi.eth',
    })
    expect(result).toBeTruthy()
    if (result) {
      expect(result.contentType).toBe(8)
      expect(result.decoded).toBe(true)
      expect(result.abi).toBe('https://example.com')
    }
  })
  it('should return undefined if unsupported contentType', async () => {
    const result = await getAbiRecord(publicClient, {
      name: 'with-type-256-abi.eth',
    })
    expect(result).toBeNull()
  })
})
