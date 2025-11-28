export const bulkRenewalRentPriceSnippet = [
  {
    inputs: [
      {
        name: 'names',
        type: 'string[]',
      },
      {
        name: 'duration',
        type: 'uint256',
      },
    ],
    name: 'rentPrice',
    outputs: [
      {
        name: 'total',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const bulkRenewalRenewAllSnippet = [
  {
    inputs: [
      {
        internalType: 'string[]',
        name: 'names',
        type: 'string[]',
      },
      {
        internalType: 'uint256',
        name: 'duration',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'referrer',
        type: 'bytes32',
      },
    ],
    name: 'renewAll',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const
