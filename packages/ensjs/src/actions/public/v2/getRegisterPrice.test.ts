import { describe, expect, it } from 'vitest'
import {
  deploymentAddresses,
  publicClient,
} from '../../../test/addTestContracts.js'
import { getRegisterPrice } from './getRegisterPrice.js'

const registrarAddress = deploymentAddresses.ETHRegistrar
const paymentToken = deploymentAddresses.USDC

// Per-second base rates from StandardRentPriceOracle.getBaseRates(), indexed by label length.
// (Lengths 0/1/2 are zero; the oracle rejects labels shorter than 3 chars as invalid.)
const BASE_RATE_PER_SEC_3CHAR = 20_280_377n
const BASE_RATE_PER_SEC_4CHAR = 5_070_095n
const BASE_RATE_PER_SEC_5CHAR = 253_505n

// USDC payment token ratio (numer / denom) from getPaymentTokenRatio()
const RATIO_NUMER = 1n
const RATIO_DENOM = 1_000_000n

// Oracle enforces a 28-day minimum duration; use that as the unit duration for the tests
const ONE_DAY = 86400n
const MIN_DURATION = ONE_DAY * 28n

// Ceiling division matching the contract's pricing computation
const ceilDiv = (a: bigint, b: bigint) => (a + b - 1n) / b

const expectedBasePrice = (perSecRate: bigint, duration: bigint) =>
  ceilDiv(perSecRate * duration * RATIO_NUMER, RATIO_DENOM)

describe('getRegisterPrice', () => {
  it('should return the correct price for a 5+ char label', async () => {
    const result = await getRegisterPrice(publicClient, {
      registrarAddress,
      label: 'test123',
      duration: MIN_DURATION,
      paymentToken,
    })

    // 7 chars -> 5+ char rate, no discount for short duration
    expect(result.base).toBe(
      expectedBasePrice(BASE_RATE_PER_SEC_5CHAR, MIN_DURATION),
    )
    expect(result.premium).toBe(0n)
  })

  it('should return a higher price for a 4 char label', async () => {
    const result = await getRegisterPrice(publicClient, {
      registrarAddress,
      label: 'wxyz',
      duration: MIN_DURATION,
      paymentToken,
    })

    expect(result.base).toBe(
      expectedBasePrice(BASE_RATE_PER_SEC_4CHAR, MIN_DURATION),
    )
    expect(result.premium).toBe(0n)
  })

  it('should return the highest price for a 3 char label', async () => {
    const result = await getRegisterPrice(publicClient, {
      registrarAddress,
      label: 'abc',
      duration: MIN_DURATION,
      paymentToken,
    })

    expect(result.base).toBe(
      expectedBasePrice(BASE_RATE_PER_SEC_3CHAR, MIN_DURATION),
    )
    expect(result.premium).toBe(0n)
  })

  it('should scale price linearly with duration (short durations, no discount)', async () => {
    const oneUnit = await getRegisterPrice(publicClient, {
      registrarAddress,
      label: 'test123',
      duration: MIN_DURATION,
      paymentToken,
    })

    const twoUnits = await getRegisterPrice(publicClient, {
      registrarAddress,
      label: 'test123',
      duration: MIN_DURATION * 2n,
      paymentToken,
    })

    expect(oneUnit.base).toBe(
      expectedBasePrice(BASE_RATE_PER_SEC_5CHAR, MIN_DURATION),
    )
    expect(twoUnits.base).toBe(
      expectedBasePrice(BASE_RATE_PER_SEC_5CHAR, MIN_DURATION * 2n),
    )
  })

  it('should enforce correct price ordering by label length', async () => {
    const duration = MIN_DURATION

    const price3 = await getRegisterPrice(publicClient, {
      registrarAddress,
      label: 'abc',
      duration,
      paymentToken,
    })
    const price4 = await getRegisterPrice(publicClient, {
      registrarAddress,
      label: 'abcd',
      duration,
      paymentToken,
    })
    const price5 = await getRegisterPrice(publicClient, {
      registrarAddress,
      label: 'abcde',
      duration,
      paymentToken,
    })

    expect(price3.base).toBeGreaterThan(price4.base)
    expect(price4.base).toBeGreaterThan(price5.base)
  })
})
