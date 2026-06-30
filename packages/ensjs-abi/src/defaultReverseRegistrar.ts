export const defaultReverseRegistrarSetNameSnippet = [
  {
    inputs: [
      {
        name: 'name',
        type: 'string',
      },
    ],
    name: 'setName',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const defaultReverseRegistrarSetNameForAddrWithSignatureSnippet = [
  {
    inputs: [
      {
        name: 'addr',
        type: 'address',
      },
      {
        name: 'signatureExpiry',
        type: 'uint256',
      },
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'coinTypes',
        type: 'uint256[]',
      },
      {
        name: 'signature',
        type: 'bytes',
      },
    ],
    name: 'setNameForAddrWithSignature',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
