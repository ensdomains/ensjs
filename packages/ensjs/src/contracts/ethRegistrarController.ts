export const rentPriceSnippet = [
  {
    inputs: [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'duration',
        type: 'uint256',
      },
    ],
    name: 'rentPrice',
    outputs: [
      {
        components: [
          {
            name: 'base',
            type: 'uint256',
          },
          {
            name: 'premium',
            type: 'uint256',
          },
        ],
        name: 'price',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const commitSnippet = [
  {
    inputs: [
      {
        name: 'commitment',
        type: 'bytes32',
      },
    ],
    name: 'commit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const commitmentsSnippet = [
  {
    inputs: [
      {
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'commitments',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const registerSnippet = [
  {
    inputs: [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'owner',
        type: 'address',
      },
      {
        name: 'duration',
        type: 'uint256',
      },
      {
        name: 'secret',
        type: 'bytes32',
      },
      {
        name: 'resolver',
        type: 'address',
      },
      {
        name: 'data',
        type: 'bytes[]',
      },
      {
        name: 'reverseRecord',
        type: 'bool',
      },
      {
        name: 'ownerControlledFuses',
        type: 'uint16',
      },
    ],
    name: 'register',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const

export const renewSnippet = [
  {
    inputs: [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'duration',
        type: 'uint256',
      },
    ],
    name: 'renew',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const
