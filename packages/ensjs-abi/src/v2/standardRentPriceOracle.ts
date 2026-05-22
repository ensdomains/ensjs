/**
 * StandardRentPriceOracle (contracts-v2 post-audit). The ETHRegistrar delegates
 * pricing and payment-token validation to a swappable `IRentPriceOracle`; this
 * is the canonical implementation. Only the read fragments the apps consume are
 * declared here.
 */

export const standardRentPriceOracleErrors = [
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
] as const

/** Per-codepoint base rate table (index = label length - 1, clamped). */
export const standardRentPriceOracleGetBaseRatesSnippet = [
  {
    inputs: [],
    name: 'getBaseRates',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

/** Fully-discounted base price for `label` over `duration` (standard units). */
export const standardRentPriceOracleGetBasePriceSnippet = [
  ...standardRentPriceOracleErrors,
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

/** Apply the duration-tiered discount to an arbitrary value. */
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

/** Ordered discount points: `{ duration, numer }` relative to DISCOUNT_DENOMINATOR. */
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

/** Expiry-premium value `duration` seconds after expiry (exponential halving). */
export const standardRentPriceOracleGetPremiumPriceAfterSnippet = [
  {
    inputs: [{ name: 'duration', type: 'uint64' }],
    name: 'getPremiumPriceAfter',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

/** Whether `paymentToken` is accepted for register/renew. */
export const standardRentPriceOracleIsPaymentTokenSnippet = [
  {
    inputs: [{ name: 'paymentToken', type: 'address' }],
    name: 'isPaymentToken',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

/** Convert a standard-unit value into `paymentToken` units. */
export const standardRentPriceOracleConvertUnitsSnippet = [
  ...standardRentPriceOracleErrors,
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

/** Immutable expiry-premium decay parameters. */
export const standardRentPriceOraclePremiumParamsSnippet = [
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
] as const
