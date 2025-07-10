// Namechain contract ABI snippets

export const namechainSetResolverSnippet = [
  {
    inputs: [
      {
        name: 'tokenId',
        type: 'uint256',
      },
      {
        name: 'resolver',
        type: 'address',
      },
    ],
    name: 'setResolver',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
