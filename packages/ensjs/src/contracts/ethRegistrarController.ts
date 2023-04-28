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
