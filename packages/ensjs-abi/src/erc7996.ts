/** ERC-7996 `IERC7996`: whether a contract implements a named feature. */
export const erc7996SupportsFeatureSnippet = [
  {
    inputs: [
      {
        name: 'featureId',
        type: 'bytes4',
      },
    ],
    name: 'supportsFeature',
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
