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
