export const availableSnippet = [
  {
    constant: true,
    inputs: [
      {
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'available',
    outputs: [
      {
        name: 'available',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const nameExpiresSnippet = [
  {
    constant: true,
    inputs: [
      {
        name: 'id',
        type: 'uint256',
      },
    ],
    name: 'nameExpires',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const gracePeriodSnippet = [
  {
    constant: true,
    inputs: [],
    name: 'GRACE_PERIOD',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const
