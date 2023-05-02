export const getDataSnippet = [
  {
    inputs: [
      {
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'getData',
    outputs: [
      {
        name: 'owner',
        type: 'address',
      },
      {
        name: 'fuses',
        type: 'uint32',
      },
      {
        name: 'expiry',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const setFusesSnippet = [
  {
    inputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
      {
        name: 'ownerControlledFuses',
        type: 'uint16',
      },
    ],
    name: 'setFuses',
    outputs: [
      {
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const setChildFusesSnippet = [
  {
    inputs: [
      {
        name: 'parentNode',
        type: 'bytes32',
      },
      {
        name: 'labelhash',
        type: 'bytes32',
      },
      {
        name: 'fuses',
        type: 'uint32',
      },
      {
        name: 'expiry',
        type: 'uint64',
      },
    ],
    name: 'setChildFuses',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const setSubnodeRecordSnippet = [
  {
    inputs: [
      {
        name: 'parentNode',
        type: 'bytes32',
      },
      {
        name: 'label',
        type: 'string',
      },
      {
        name: 'owner',
        type: 'address',
      },
      {
        name: 'resolver',
        type: 'address',
      },
      {
        name: 'ttl',
        type: 'uint64',
      },
      {
        name: 'fuses',
        type: 'uint32',
      },
      {
        name: 'expiry',
        type: 'uint64',
      },
    ],
    name: 'setSubnodeRecord',
    outputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const setRecordSnippet = [
  {
    inputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
      {
        name: 'owner',
        type: 'address',
      },
      {
        name: 'resolver',
        type: 'address',
      },
      {
        name: 'ttl',
        type: 'uint64',
      },
    ],
    name: 'setRecord',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
