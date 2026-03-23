import { describe, expect, it } from 'vitest'
import {
  deploymentAddresses,
  publicClient,
} from '../../../test/addTestContracts.js'
import { getPrice } from './getPrice.js'

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

describe('getPrice', () => {
  it('should return the correct price for a 5+ char name', async () => {
    const result = await getPrice(publicClient, {
      registrarAddress,
      nameOrNames: 'test123.eth',
      duration: ONE_DAY,
      paymentToken,
    })

    // 7 chars -> 5+ char rate, no discount for short duration
    const expectedBase = ceilDiv(ANNUAL_RATE_5CHAR * ONE_DAY, SEC_PER_YEAR)
    expect(result.base).toBe(expectedBase)
    expect(result.premium).toBe(0n)
  })

  it('should return a higher price for a 4 char name', async () => {
    const result = await getPrice(publicClient, {
      registrarAddress,
      nameOrNames: 'test.eth',
      duration: ONE_DAY,
      paymentToken,
    })

    const expectedBase = ceilDiv(ANNUAL_RATE_4CHAR * ONE_DAY, SEC_PER_YEAR)
    expect(result.base).toBe(expectedBase)
    expect(result.premium).toBe(0n)
  })

  it('should return the highest price for a 3 char name', async () => {
    const result = await getPrice(publicClient, {
      registrarAddress,
      nameOrNames: 'abc.eth',
      duration: ONE_DAY,
      paymentToken,
    })

    const expectedBase = ceilDiv(ANNUAL_RATE_3CHAR * ONE_DAY, SEC_PER_YEAR)
    expect(result.base).toBe(expectedBase)
    expect(result.premium).toBe(0n)
  })

  it('should scale price linearly with duration (short durations, no discount)', async () => {
    const oneDay = await getPrice(publicClient, {
      registrarAddress,
      nameOrNames: 'test123.eth',
      duration: ONE_DAY,
      paymentToken,
    })

    const twoDays = await getPrice(publicClient, {
      registrarAddress,
      nameOrNames: 'test123.eth',
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

  it('should enforce correct price ordering by name length', async () => {
    const duration = ONE_DAY

    const [price3, price4, price5] = await Promise.all([
      getPrice(publicClient, {
        registrarAddress,
        nameOrNames: 'abc.eth',
        duration,
        paymentToken,
      }),
      getPrice(publicClient, {
        registrarAddress,
        nameOrNames: 'abcd.eth',
        duration,
        paymentToken,
      }),
      getPrice(publicClient, {
        registrarAddress,
        nameOrNames: 'abcde.eth',
        duration,
        paymentToken,
      }),
    ])

    expect(price3.base).toBeGreaterThan(price4.base)
    expect(price4.base).toBeGreaterThan(price5.base)
  })

  it('should aggregate prices for an array of names', async () => {
    const [single1, single2, combined] = await Promise.all([
      getPrice(publicClient, {
        registrarAddress,
        nameOrNames: 'test123.eth',
        duration: ONE_DAY,
        paymentToken,
      }),
      getPrice(publicClient, {
        registrarAddress,
        nameOrNames: 'another.eth',
        duration: ONE_DAY,
        paymentToken,
      }),
      getPrice(publicClient, {
        registrarAddress,
        nameOrNames: ['test123.eth', 'another.eth'],
        duration: ONE_DAY,
        paymentToken,
      }),
    ])

    expect(combined.base).toBe(single1.base + single2.base)
    expect(combined.premium).toBe(single1.premium + single2.premium)
  })

  it('should allow labels as inputs', async () => {
    const withSuffix = await getPrice(publicClient, {
      registrarAddress,
      nameOrNames: 'test123.eth',
      duration: ONE_DAY,
      paymentToken,
    })

    const labelOnly = await getPrice(publicClient, {
      registrarAddress,
      nameOrNames: 'test123',
      duration: ONE_DAY,
      paymentToken,
    })

    expect(labelOnly.base).toBe(withSuffix.base)
  })

  it('should throw for unsupported name types', async () => {
    await expect(
      getPrice(publicClient, {
        registrarAddress,
        nameOrNames: 'sub.test123.eth',
        duration: ONE_DAY,
        paymentToken,
      }),
    ).rejects.toThrowError(
      'Currently only the price of eth-2ld names can be fetched',
    )
  })
})
