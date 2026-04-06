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

export const defaultReverseRegistrarSetNameForAddrSnippet = [
  {
    inputs: [
      {
        name: 'addr',
        type: 'address',
      },
      {
        name: 'name',
        type: 'string',
      },
    ],
    name: 'setNameForAddr',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
