export const singleAddrSnippet = [
  {
    inputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
    ],
    name: 'addr',
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const multiAddrSnippet = [
  {
    inputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
      {
        name: 'coinType',
        type: 'uint256',
      },
    ],
    name: 'addr',
    outputs: [
      {
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const textSnippet = [
  {
    inputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
      {
        name: 'key',
        type: 'string',
      },
    ],
    name: 'text',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const contenthashSnippet = [
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'node',
        type: 'bytes32',
      },
    ],
    name: 'contenthash',
    outputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const abiSnippet = [
  {
    inputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
      {
        name: 'contentTypes',
        type: 'uint256',
      },
    ],
    name: 'ABI',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
      {
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const
