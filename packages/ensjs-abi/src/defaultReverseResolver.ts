export const defaultReverseResolverResolveNamesSnippet = [
  {
    inputs: [
      {
        name: 'addrs',
        type: 'address[]',
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
