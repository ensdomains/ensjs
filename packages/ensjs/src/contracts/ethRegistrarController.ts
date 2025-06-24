export const ethRegistrarControllerErrors = [
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'commitment',
        type: 'bytes32',
      },
    ],
    name: 'CommitmentNotFound',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'commitment',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'minimumCommitmentTimestamp',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'currentTimestamp',
        type: 'uint256',
      },
    ],
    name: 'CommitmentTooNew',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'commitment',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'maximumCommitmentTimestamp',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'currentTimestamp',
        type: 'uint256',
      },
    ],
    name: 'CommitmentTooOld',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'duration',
        type: 'uint256',
      },
    ],
    name: 'DurationTooShort',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InsufficientValue',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MaxCommitmentAgeTooHigh',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MaxCommitmentAgeTooLow',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
    ],
    name: 'NameNotAvailable',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ResolverRequiredForReverseRecord',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ResolverRequiredWhenDataSupplied',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'commitment',
        type: 'bytes32',
      },
    ],
    name: 'UnexpiredCommitmentExists',
    type: 'error',
  },
] as const

export const ethRegistrarControllerRentPriceSnippet = [
  ...ethRegistrarControllerErrors,
  {
    inputs: [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'duration',
        type: 'uint256',
      },
    ],
    name: 'rentPrice',
    outputs: [
      {
        components: [
          {
            name: 'base',
            type: 'uint256',
          },
          {
            name: 'premium',
            type: 'uint256',
          },
        ],
        name: 'price',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const ethRegistrarControllerCommitSnippet = [
  ...ethRegistrarControllerErrors,
  {
    inputs: [
      {
        name: 'commitment',
        type: 'bytes32',
      },
    ],
    name: 'commit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const ethRegistrarControllerCommitmentsSnippet = [
  ...ethRegistrarControllerErrors,
  {
    inputs: [
      {
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'commitments',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const ethRegistrarControllerRegisterSnippet = [
  ...ethRegistrarControllerErrors,
  {
    inputs: [
      {
        components: [
          {
            name: 'label',
            type: 'string',
          },
          {
            name: 'owner',
            type: 'address',
          },
          {
            name: 'duration',
            type: 'uint256',
          },
          {
            name: 'secret',
            type: 'bytes32',
          },
          {
            name: 'resolver',
            type: 'address',
          },
          {
            name: 'data',
            type: 'bytes[]',
          },
          {
            name: 'reverseRecord',
            type: 'uint8',
          },
          {
            name: 'referrer',
            type: 'bytes32',
          },
        ],
        name: 'registration',
        type: 'tuple',
      },
    ],
    name: 'register',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const

export const ethRegistrarControllerRenewSnippet = [
  ...ethRegistrarControllerErrors,
  {
    inputs: [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'duration',
        type: 'uint256',
      },
      {
        name: 'referrer',
        type: 'bytes32',
      },
    ],
    name: 'renew',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const

export const wrappedEthRegistrarControllerRenewSnippet = [
  ...ethRegistrarControllerErrors,
  {
    inputs: [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'duration',
        type: 'uint256',
      },
    ],
    name: 'renew',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const
