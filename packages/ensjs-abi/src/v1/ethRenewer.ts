export const ethRenewerV1NameRenewedEventSnippet = {
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

export const ethRenewerV1Errors = [
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

export const ethRenewerV1RenewSnippet = [
  ...ethRenewerV1Errors,
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

export const ethRenewerV1GetRenewPriceSnippet = [
  ...ethRenewerV1Errors,
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

export const ethRenewerV1IsRenewableSnippet = [
  {
    inputs: [{ name: 'label', type: 'string' }],
    name: 'isRenewable',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const ethRenewerV1GetRemainingGracePeriodSnippet = [
  {
    inputs: [{ name: 'label', type: 'string' }],
    name: 'getRemainingGracePeriod',
    outputs: [{ name: '', type: 'uint64' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const ethRenewerV1GracePeriodSnippet = [
  {
    inputs: [],
    name: 'GRACE_PERIOD',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const ethRenewerV1BaseRegistrarSnippet = [
  {
    inputs: [],
    name: 'BASE_REGISTRAR',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
