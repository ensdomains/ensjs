export const publicSuffixListIsPublicSuffixSnippet = [
  {
    inputs: [
      {
        name: 'name',
        type: 'bytes',
      },
    ],
    name: 'isPublicSuffix',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const
