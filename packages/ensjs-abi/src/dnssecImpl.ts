export const dnssecImplErrors = [
  {
    inputs: [
      { name: 'inception', type: 'uint32' },
      { name: 'now', type: 'uint32' },
    ],
    name: 'SignatureExpired',
    type: 'error',
  },
] as const

export const dnssecImplVerifyRrSetSnippet = [
  ...dnssecImplErrors,
  {
    inputs: [
      {
        components: [
          {
            name: 'rrset',
            type: 'bytes',
          },
          {
            name: 'sig',
            type: 'bytes',
          },
        ],
        name: 'input',
        type: 'tuple[]',
      },
    ],
    name: 'verifyRRSet',
    outputs: [
      {
        name: 'rrs',
        type: 'bytes',
      },
      {
        name: 'inception',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const dnssecImplAnchorsSnippet = [
  {
    inputs: [],
    name: 'anchors',
    outputs: [
      {
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const
