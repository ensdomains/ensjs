import { describe, expect, it } from 'vitest'
import {
  publicClientL2 as client,
  localhostL2,
} from '../../../test/addTestContracts.js'
import { getPrice } from './getPrice.js'

const registrarAddress = localhostL2.contracts.ethRegistrar.address
const paymentToken = localhostL2.contracts.usdc.address

// Pricing constants from StandardRentPriceOracle
const PRICE_SCALE = 10n ** 12n
const SEC_PER_YEAR = 31_557_600n

// Base rates per year (in PRICE_SCALE units)
const ANNUAL_RATE_3CHAR = 640n * PRICE_SCALE
const ANNUAL_RATE_4CHAR = 160n * PRICE_SCALE
const ANNUAL_RATE_5CHAR = 5n * PRICE_SCALE

// Per-second rates (ceiling division to match contract)
const RATE_3CP = (ANNUAL_RATE_3CHAR + SEC_PER_YEAR - 1n) / SEC_PER_YEAR
const RATE_4CP = (ANNUAL_RATE_4CHAR + SEC_PER_YEAR - 1n) / SEC_PER_YEAR
const RATE_5CP = (ANNUAL_RATE_5CHAR + SEC_PER_YEAR - 1n) / SEC_PER_YEAR

const ONE_DAY = 86400n

describe('getPrice', () => {
  it('should return the correct price for a 5+ char name', async () => {
    const result = await getPrice(client, {
      registrarAddress,
      nameOrNames: 'test123.eth',
      duration: ONE_DAY,
      paymentToken,
    })

    // 7 chars -> 5+ char rate, no discount for short duration
    const expectedBase = RATE_5CP * ONE_DAY
    expect(result.base).toBe(expectedBase)
    expect(result.premium).toBe(0n)
  })

  it('should return a higher price for a 4 char name', async () => {
    const result = await getPrice(client, {
      registrarAddress,
      nameOrNames: 'test.eth',
      duration: ONE_DAY,
      paymentToken,
    })

    const expectedBase = RATE_4CP * ONE_DAY
    expect(result.base).toBe(expectedBase)
    expect(result.premium).toBe(0n)
  })

  it('should return the highest price for a 3 char name', async () => {
    const result = await getPrice(client, {
      registrarAddress,
      nameOrNames: 'abc.eth',
      duration: ONE_DAY,
      paymentToken,
    })

    const expectedBase = RATE_3CP * ONE_DAY
    expect(result.base).toBe(expectedBase)
    expect(result.premium).toBe(0n)
  })

  it('should scale price linearly with duration (short durations, no discount)', async () => {
    const oneDay = await getPrice(client, {
      registrarAddress,
      nameOrNames: 'test123.eth',
      duration: ONE_DAY,
      paymentToken,
    })

    const twoDays = await getPrice(client, {
      registrarAddress,
      nameOrNames: 'test123.eth',
      duration: ONE_DAY * 2n,
      paymentToken,
    })

    expect(twoDays.base).toBe(oneDay.base * 2n)
  })

  it('should enforce correct price ordering by name length', async () => {
    const duration = ONE_DAY

    const [price3, price4, price5] = await Promise.all([
      getPrice(client, {
        registrarAddress,
        nameOrNames: 'abc.eth',
        duration,
        paymentToken,
      }),
      getPrice(client, {
        registrarAddress,
        nameOrNames: 'abcd.eth',
        duration,
        paymentToken,
      }),
      getPrice(client, {
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
      getPrice(client, {
        registrarAddress,
        nameOrNames: 'test123.eth',
        duration: ONE_DAY,
        paymentToken,
      }),
      getPrice(client, {
        registrarAddress,
        nameOrNames: 'another.eth',
        duration: ONE_DAY,
        paymentToken,
      }),
      getPrice(client, {
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
    const withSuffix = await getPrice(client, {
      registrarAddress,
      nameOrNames: 'test123.eth',
      duration: ONE_DAY,
      paymentToken,
    })

    const labelOnly = await getPrice(client, {
      registrarAddress,
      nameOrNames: 'test123',
      duration: ONE_DAY,
      paymentToken,
    })

    expect(labelOnly.base).toBe(withSuffix.base)
  })

  it('should throw for unsupported name types', async () => {
    await expect(
      getPrice(client, {
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
