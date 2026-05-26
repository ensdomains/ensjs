import { describe, expect, it } from 'vitest'
import {
  deploymentAddresses,
  publicClient,
} from '../../../test/addTestContracts.js'
import { getRegisterPrice } from './getRegisterPrice.js'

const registrarAddress = deploymentAddresses.ETHRegistrar
const paymentToken = deploymentAddresses.USDC

// Pricing constants from StandardRentPriceOracle
const USDC_DECIMALS = 10n ** 6n
const SEC_PER_YEAR = 31_557_600n

// Annual rates in USDC (6 decimals)
const ANNUAL_RATE_3CHAR = 640n * USDC_DECIMALS
const ANNUAL_RATE_4CHAR = 160n * USDC_DECIMALS
const ANNUAL_RATE_5CHAR = 5n * USDC_DECIMALS

const ONE_DAY = 86400n

// Ceiling division matching the contract's pricing computation
const ceilDiv = (a: bigint, b: bigint) => (a + b - 1n) / b

describe('getRegisterPrice', () => {
  it('should return the correct price for a 5+ char label', async () => {
    const result = await getRegisterPrice(publicClient, {
      registrarAddress,
      label: 'test123',
      duration: ONE_DAY,
      paymentToken,
    })

    // 7 chars -> 5+ char rate, no discount for short duration
    const expectedBase = ceilDiv(ANNUAL_RATE_5CHAR * ONE_DAY, SEC_PER_YEAR)
    expect(result.base).toBe(expectedBase)
    expect(result.premium).toBe(0n)
  })

  it('should return a higher price for a 4 char label', async () => {
    const result = await getRegisterPrice(publicClient, {
      registrarAddress,
      label: 'test',
      duration: ONE_DAY,
      paymentToken,
    })

    const expectedBase = ceilDiv(ANNUAL_RATE_4CHAR * ONE_DAY, SEC_PER_YEAR)
    expect(result.base).toBe(expectedBase)
    expect(result.premium).toBe(0n)
  })

  it('should return the highest price for a 3 char label', async () => {
    const result = await getRegisterPrice(publicClient, {
      registrarAddress,
      label: 'abc',
      duration: ONE_DAY,
      paymentToken,
    })

    const expectedBase = ceilDiv(ANNUAL_RATE_3CHAR * ONE_DAY, SEC_PER_YEAR)
    expect(result.base).toBe(expectedBase)
    expect(result.premium).toBe(0n)
  })

  it('should scale price linearly with duration (short durations, no discount)', async () => {
    const oneDay = await getRegisterPrice(publicClient, {
      registrarAddress,
      label: 'test123',
      duration: ONE_DAY,
      paymentToken,
    })

    const twoDays = await getRegisterPrice(publicClient, {
      registrarAddress,
      label: 'test123',
      duration: ONE_DAY * 2n,
      paymentToken,
    })

    const expectedOneDay = ceilDiv(ANNUAL_RATE_5CHAR * ONE_DAY, SEC_PER_YEAR)
    const expectedTwoDays = ceilDiv(
      ANNUAL_RATE_5CHAR * ONE_DAY * 2n,
      SEC_PER_YEAR,
    )
    expect(oneDay.base).toBe(expectedOneDay)
    expect(twoDays.base).toBe(expectedTwoDays)
  })

  it('should enforce correct price ordering by label length', async () => {
    const duration = ONE_DAY

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
