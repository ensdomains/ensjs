export const defaultReverseResolverResolveNamesSnippet = [
  {
    inputs: [
      {
        name: 'addrs',
        type: 'address[]',
      },
      {
        name: 'perPage',
        type: 'uint8',
      },
    ],
    name: 'resolveNames',
    outputs: [
      {
        name: 'names',
        type: 'string[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const
