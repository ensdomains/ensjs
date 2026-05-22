/**
 * ABI snippets for `StandardRentPriceOracle`.
 *
 * Pricing/oracle contract used by `ETHRegistrar` and `ETHRenewerV1`. End users typically
 * call the registrar's 3-arg `getRegisterPrice` / `getRenewPrice`; these snippets expose
 * the oracle's lower-level functions plus its admin surface.
 */

export const standardRentPriceOracleErrors = [
  // from `IRentPriceOracle`
  {
    inputs: [{ name: 'label', type: 'string' }],
    name: 'NotValid',
    type: 'error',
  },
  {
    inputs: [{ name: 'paymentToken', type: 'address' }],
    name: 'PaymentTokenNotSupported',
    type: 'error',
  },
  // local to `StandardRentPriceOracle`
  {
    inputs: [],
    name: 'InvalidBaseRates',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidRatio',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidDiscount',
    type: 'error',
  },
] as const

export const standardRentPriceOraclePaymentTokenUpdatedEventSnippet = {
  type: 'event',
  name: 'PaymentTokenUpdated',
  inputs: [
    { name: 'paymentToken', type: 'address', indexed: true },
    { name: 'numer', type: 'uint128', indexed: false },
    { name: 'denom', type: 'uint128', indexed: false },
  ],
  anonymous: false,
} as const

/** `IRentPriceOracle.getRegisterPrice(label, available, duration, paymentToken)`. */
export const standardRentPriceOracleGetRegisterPriceSnippet = [
  ...standardRentPriceOracleErrors,
  {
    inputs: [
      { name: 'label', type: 'string' },
      { name: 'available', type: 'uint64' },
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

/** `IRentPriceOracle.getRenewPrice(label, expiry, duration, paymentToken)`. */
export const standardRentPriceOracleGetRenewPriceSnippet = [
  ...standardRentPriceOracleErrors,
  {
    inputs: [
      { name: 'label', type: 'string' },
      { name: 'expiry', type: 'uint64' },
      { name: 'duration', type: 'uint64' },
      { name: 'paymentToken', type: 'address' },
    ],
    name: 'getRenewPrice',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const standardRentPriceOracleGetBasePriceSnippet = [
  {
    inputs: [
      { name: 'label', type: 'string' },
      { name: 'duration', type: 'uint64' },
    ],
    name: 'getBasePrice',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const standardRentPriceOracleGetPremiumPriceAfterSnippet = [
  {
    inputs: [{ name: 'duration', type: 'uint64' }],
    name: 'getPremiumPriceAfter',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const standardRentPriceOracleApplyDiscountSnippet = [
  {
    inputs: [
      { name: 'value', type: 'uint256' },
      { name: 'duration', type: 'uint64' },
    ],
    name: 'applyDiscount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const standardRentPriceOracleConvertUnitsSnippet = [
  {
    inputs: [
      { name: 'value', type: 'uint256' },
      { name: 'paymentToken', type: 'address' },
    ],
    name: 'convertUnits',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const standardRentPriceOracleGetBaseRatesSnippet = [
  {
    inputs: [],
    name: 'getBaseRates',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const standardRentPriceOracleGetDiscountPointsSnippet = [
  {
    inputs: [],
    name: 'getDiscountPoints',
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'duration', type: 'uint64' },
          { name: 'numer', type: 'uint128' },
        ],
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const standardRentPriceOracleGetLengthSnippet = [
  {
    inputs: [{ name: 'label', type: 'string' }],
    name: 'getLength',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'pure',
    type: 'function',
  },
] as const

export const standardRentPriceOracleIsValidSnippet = [
  {
    inputs: [{ name: 'label', type: 'string' }],
    name: 'isValid',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const standardRentPriceOracleIsPaymentTokenSnippet = [
  {
    inputs: [{ name: 'paymentToken', type: 'address' }],
    name: 'isPaymentToken',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const standardRentPriceOracleGetPaymentTokenRatioSnippet = [
  {
    inputs: [{ name: 'paymentToken', type: 'address' }],
    name: 'getPaymentTokenRatio',
    outputs: [
      { name: 'numer', type: 'uint128' },
      { name: 'denom', type: 'uint128' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const standardRentPriceOracleUpdatePaymentTokenSnippet = [
  ...standardRentPriceOracleErrors,
  {
    inputs: [
      { name: 'paymentToken', type: 'address' },
      { name: 'numer', type: 'uint128' },
      { name: 'denom', type: 'uint128' },
    ],
    name: 'updatePaymentToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const standardRentPriceOracleDisablePaymentTokenSnippet = [
  {
    inputs: [{ name: 'paymentToken', type: 'address' }],
    name: 'disablePaymentToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

export const standardRentPriceOracleConstantsSnippet = [
  {
    inputs: [],
    name: 'DISCOUNT_DENOMINATOR',
    outputs: [{ name: '', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PREMIUM_PRICE_INITIAL',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PREMIUM_HALVING_PERIOD',
    outputs: [{ name: '', type: 'uint64' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PREMIUM_PERIOD',
    outputs: [{ name: '', type: 'uint64' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PREMIUM_PRICE_OFFSET',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
