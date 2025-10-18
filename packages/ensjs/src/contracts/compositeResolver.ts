export const compositeResolverGetResolver = [
  {
    inputs: [
      {
        name: 'name',
        type: 'bytes',
      },
    ],
    name: 'getResolver',
    outputs: [
      {
        name: 'resolver',
        type: 'address',
      },
      {
        name: 'offchain',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const
