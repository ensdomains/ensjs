export const reverseSnippet = [
  {
    inputs: [
      {
        name: 'reverseName',
        type: 'bytes',
      },
    ],
    name: 'reverse',
    outputs: [
      { type: 'string', name: 'resolvedName' },
      { type: 'address', name: 'resolvedAddress' },
      { type: 'address', name: 'reverseResolver' },
      { type: 'address', name: 'resolver' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const resolveSnippet = [
  {
    inputs: [
      {
        name: 'name',
        type: 'bytes',
      },
      {
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'resolve',
    outputs: [
      {
        name: 'data',
        type: 'bytes',
      },
      {
        name: 'resolver',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const
