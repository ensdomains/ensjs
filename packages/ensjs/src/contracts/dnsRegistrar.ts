export const proveAndClaimSnippet = [
  {
    inputs: [
      {
        name: 'name',
        type: 'bytes',
      },
      {
        components: [
          {
            name: 'rrset',
            type: 'bytes',
          },
          {
            name: 'sig',
            type: 'bytes',
          },
        ],
        name: 'input',
        type: 'tuple[]',
      },
      {
        name: 'proof',
        type: 'bytes',
      },
    ],
    name: 'proveAndClaim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const proveAndClaimWithResolverSnippet = [
  {
    inputs: [
      {
        name: 'name',
        type: 'bytes',
      },
      {
        components: [
          {
            name: 'rrset',
            type: 'bytes',
          },
          {
            name: 'sig',
            type: 'bytes',
          },
        ],
        name: 'input',
        type: 'tuple[]',
      },
      {
        name: 'proof',
        type: 'bytes',
      },
      {
        name: 'resolver',
        type: 'address',
      },
      {
        name: 'addr',
        type: 'address',
      },
    ],
    name: 'proveAndClaimWithResolver',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
