export const ethRegistrarNameRegisteredEventSnippet = {
  type: 'event',
  name: 'NameRegistered',
  inputs: [
    { name: 'tokenId', type: 'uint256', indexed: true },
    { name: 'label', type: 'string', indexed: false },
    { name: 'owner', type: 'address', indexed: false },
    { name: 'subregistry', type: 'address', indexed: false },
    { name: 'resolver', type: 'address', indexed: false },
    { name: 'duration', type: 'uint64', indexed: false },
    { name: 'paymentToken', type: 'address', indexed: false },
    { name: 'referrer', type: 'bytes32', indexed: true },
    { name: 'base', type: 'uint256', indexed: false },
    { name: 'premium', type: 'uint256', indexed: false },
  ],
  anonymous: false,
} as const

export const ethRegistrarNameRenewedEventSnippet = {
  type: 'event',
  name: 'NameRenewed',
  inputs: [
    { name: 'tokenId', type: 'uint256', indexed: true },
    { name: 'label', type: 'string', indexed: false },
    { name: 'duration', type: 'uint64', indexed: false },
    { name: 'newExpiry', type: 'uint64', indexed: false },
    { name: 'paymentToken', type: 'address', indexed: false },
    { name: 'referrer', type: 'bytes32', indexed: true },
    { name: 'amount', type: 'uint256', indexed: false },
  ],
  anonymous: false,
} as const

export const ethRegistrarCommitmentMadeEventSnippet = {
  type: 'event',
  name: 'CommitmentMade',
  inputs: [{ name: 'commitment', type: 'bytes32', indexed: false }],
  anonymous: false,
} as const

export const ethRegistrarRentPriceOracleUpdatedEventSnippet = {
  type: 'event',
  name: 'RentPriceOracleUpdated',
  inputs: [{ name: 'oracle', type: 'address', indexed: false }],
  anonymous: false,
} as const

export const ethRegistrarErrors = [
  {
    inputs: [
      { name: 'commitment', type: 'bytes32' },
      { name: 'validFrom', type: 'uint64' },
      { name: 'blockTimestamp', type: 'uint64' },
    ],
    name: 'CommitmentTooNew',
    type: 'error',
  },
  {
    inputs: [
      { name: 'commitment', type: 'bytes32' },
      { name: 'validTo', type: 'uint64' },
      { name: 'blockTimestamp', type: 'uint64' },
    ],
    name: 'CommitmentTooOld',
    type: 'error',
  },
  {
    inputs: [
      { name: 'duration', type: 'uint64' },
      { name: 'minDuration', type: 'uint64' },
    ],
    name: 'DurationTooShort',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidOwner',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MaxCommitmentAgeTooLow',
    type: 'error',
  },
  {
    inputs: [{ name: 'label', type: 'string' }],
    name: 'NameNotAvailable',
    type: 'error',
  },
  {
    inputs: [{ name: 'label', type: 'string' }],
    name: 'NameNotRenewable',
    type: 'error',
  },
  // bubbled from `IRentPriceOracle` via `getRegisterPrice` / `getRenewPrice`
  {
    inputs: [{ name: 'label', type: 'string' }],
    name: 'NotValid',
    type: 'error',
  },
  // bubbled from `IRentPriceOracle` via `getRegisterPrice` / `getRenewPrice`
  {
    inputs: [{ name: 'paymentToken', type: 'address' }],
    name: 'PaymentTokenNotSupported',
    type: 'error',
  },
  {
    inputs: [{ name: 'token', type: 'address' }],
    name: 'SafeERC20FailedOperation',
    type: 'error',
  },
  {
    inputs: [{ name: 'commitment', type: 'bytes32' }],
    name: 'UnexpiredCommitmentExists',
    type: 'error',
  },
] as const

export const ethRegistrarGetRegisterPriceSnippet = [
  ...ethRegistrarErrors,
  {
    inputs: [
      { name: 'label', type: 'string' },
      { name: 'duration', type: 'uint64' },
      { name: 'paymentToken', type: 'address' },
    ],
    name: 'getRegisterPrice',
    outputs: [
      { name: 'base', type: 'uint256' },
      { name: 'premium', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const ethRegistrarGetRenewPriceSnippet = [
  ...ethRegistrarErrors,
  {
    inputs: [
      { name: 'label', type: 'string' },
      { name: 'duration', type: 'uint64' },
      { name: 'paymentToken', type: 'address' },
    ],
    name: 'getRenewPrice',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const ethRegistrarRentPriceOracleSnippet = [
  {
    inputs: [],
    name: 'rentPriceOracle',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const ethRegistrarIsRenewableSnippet = [
  {
    inputs: [{ name: 'label', type: 'string' }],
    name: 'isRenewable',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const ethRegistrarGetRemainingGracePeriodSnippet = [
  {
    inputs: [{ name: 'label', type: 'string' }],
    name: 'getRemainingGracePeriod',
    outputs: [{ name: '', type: 'uint64' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const ethRegistrarCommitSnippet = [
  ...ethRegistrarErrors,
  {
    inputs: [{ name: 'commitment', type: 'bytes32' }],
    name: 'commit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const ethRegistrarMakeCommitmentSnippet = [
  ...ethRegistrarErrors,
  {
    inputs: [
      { name: 'label', type: 'string' },
      { name: 'owner', type: 'address' },
      { name: 'secret', type: 'bytes32' },
      { name: 'subregistry', type: 'address' },
      { name: 'resolver', type: 'address' },
      { name: 'duration', type: 'uint64' },
      { name: 'referrer', type: 'bytes32' },
    ],
    name: 'makeCommitment',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function',
  },
] as const

export const ethRegistrarCommitmentsSnippet = [
  ...ethRegistrarErrors,
  {
    inputs: [{ name: 'commitment', type: 'bytes32' }],
    name: 'commitmentAt',
    outputs: [{ name: 'commitTime', type: 'uint64' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const ethRegistrarAvailableSnippet = [
  ...ethRegistrarErrors,
  {
    inputs: [{ name: 'label', type: 'string' }],
    name: 'isAvailable',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const ethRegistrarIsAvailableSnippet = [
  {
    name: 'isAvailable',
    inputs: [{ name: 'label', type: 'string' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const ethRegistrarRegisterSnippet = [
  ...ethRegistrarErrors,
  {
    type: 'function',
    name: 'register',
    inputs: [
      { name: 'label', type: 'string' },
      { name: 'owner', type: 'address' },
      { name: 'secret', type: 'bytes32' },
      { name: 'subregistry', type: 'address' },
      { name: 'resolver', type: 'address' },
      { name: 'duration', type: 'uint64' },
      { name: 'paymentToken', type: 'address' },
      { name: 'referrer', type: 'bytes32' },
    ],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
] as const

export const ethRegistrarRenewErrors = [
  {
    inputs: [
      { name: 'duration', type: 'uint64' },
      { name: 'minDuration', type: 'uint64' },
    ],
    name: 'DurationTooShort',
    type: 'error',
  },
  {
    inputs: [{ name: 'label', type: 'string' }],
    name: 'NameNotRenewable',
    type: 'error',
  },
  // bubbled from `IRentPriceOracle` via `getRenewPrice`
  {
    inputs: [{ name: 'paymentToken', type: 'address' }],
    name: 'PaymentTokenNotSupported',
    type: 'error',
  },
  {
    inputs: [{ name: 'token', type: 'address' }],
    name: 'SafeERC20FailedOperation',
    type: 'error',
  },
] as const

export const ethRegistrarRenewSnippet = [
  ...ethRegistrarRenewErrors,
  {
    inputs: [
      { name: 'label', type: 'string' },
      { name: 'duration', type: 'uint64' },
      { name: 'paymentToken', type: 'address' },
      { name: 'referrer', type: 'bytes32' },
    ],
    name: 'renew',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
