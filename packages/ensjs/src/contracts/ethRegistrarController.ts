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
        internalType: 'string',
        name: 'label',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'duration',
        type: 'uint256',
      },
    ],
    name: 'rentPrice',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'base',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'premium',
            type: 'uint256',
          },
        ],
        internalType: 'struct IPriceOracle.Price',
        name: 'price',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const ethRegistrarControllerMakeCommitmentSnippet = [
  ...ethRegistrarControllerErrors,
  {
    inputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'label',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'duration',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'secret',
            type: 'bytes32',
          },
          {
            internalType: 'address',
            name: 'resolver',
            type: 'address',
          },
          {
            internalType: 'bytes[]',
            name: 'data',
            type: 'bytes[]',
          },
          {
            internalType: 'uint8',
            name: 'reverseRecord',
            type: 'uint8',
          },
          {
            internalType: 'bytes32',
            name: 'referrer',
            type: 'bytes32',
          },
        ],
        internalType: 'struct IETHRegistrarController.Registration',
        name: 'registration',
        type: 'tuple',
      },
    ],
    name: 'makeCommitment',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'commitment',
        type: 'bytes32',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
] as const

export const ethRegistrarControllerCommitSnippet = [
  ...ethRegistrarControllerErrors,
  {
    inputs: [
      {
        internalType: 'bytes32',
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
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    name: 'commitments',
    outputs: [
      {
        internalType: 'uint256',
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
            internalType: 'string',
            name: 'label',
            type: 'string',
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'duration',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'secret',
            type: 'bytes32',
          },
          {
            internalType: 'address',
            name: 'resolver',
            type: 'address',
          },
          {
            internalType: 'bytes[]',
            name: 'data',
            type: 'bytes[]',
          },
          {
            internalType: 'uint8',
            name: 'reverseRecord',
            type: 'uint8',
          },
          {
            internalType: 'bytes32',
            name: 'referrer',
            type: 'bytes32',
          },
        ],
        internalType: 'struct IETHRegistrarController.Registration',
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
        internalType: 'string',
        name: 'label',
        type: 'string',
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
    name: 'renew',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const

export const ethRegistrarControllerNameRegisteredEventSnippet = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'label',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'labelhash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'baseCost',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'premium',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'expires',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'referrer',
        type: 'bytes32',
      },
    ],
    name: 'NameRegistered',
    type: 'event',
  },
] as const
