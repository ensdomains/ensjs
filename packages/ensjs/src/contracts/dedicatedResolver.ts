export const dedicatedResolverSetTextSnippet = [
  {
    inputs: [
      {
        internalType: 'string',
        name: 'key',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'value',
        type: 'string',
      },
    ],
    name: 'setText',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const dedicatedResolverSetContentHashSnippet = [
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'hash',
        type: 'bytes',
      },
    ],
    name: 'setContenthash',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
