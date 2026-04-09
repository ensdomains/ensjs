export const dedicatedResolverSetTextSnippet = [
  {
    inputs: [
      {
        name: 'key',
        type: 'string',
      },
      {
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

export const dedicatedResolverSetAddrSnippet = [
  {
    inputs: [
      {
        name: 'coinType',
        type: 'uint256',
      },
      {
        name: 'addressBytes',
        type: 'bytes',
      },
    ],
    name: 'setAddr',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const dedicatedResolverNameSnippet = [
  {
    inputs: [
      {
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const dedicatedResolverMulticallWithNodeCheckSnippet = [
  {
    inputs: [
      {
        name: '',
        type: 'bytes32',
      },
      {
        name: 'calls',
        type: 'bytes[]',
      },
    ],
    name: 'multicallWithNodeCheck',
    outputs: [
      {
        name: '',
        type: 'bytes[]',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const dedicatedResolverSetAbiSnippet = [
  {
    inputs: [
      {
        name: 'contentType',
        type: 'uint256',
      },
      {
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'setABI',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
