import { describe, expect, it } from 'vitest'
import { publicClient } from '../../../test/addTestContracts.js'
import { applyDiscount } from './applyDiscount.js'

const ONE_YEAR = 31_557_600n
const TWENTY_EIGHT_DAYS = 86_400n * 28n

describe('applyDiscount', () => {
  it('returns the input unchanged at the 1y tier (no discount)', async () => {
    const result = await applyDiscount(publicClient, {
      value: 10_000n,
      duration: ONE_YEAR,
    })

    expect(result).toBe(10_000n)
  })

  it('returns the input unchanged for short durations below the 1y tier', async () => {
    const result = await applyDiscount(publicClient, {
      value: 10_000n,
      duration: TWENTY_EIGHT_DAYS,
    })

    expect(result).toBe(10_000n)
  })

  it('returns zero when value is zero (no discount on nothing)', async () => {
    const result = await applyDiscount(publicClient, {
      value: 0n,
      duration: ONE_YEAR * 5n,
    })

    expect(result).toBe(0n)
  })

  it('coerces a number duration to bigint without loss', async () => {
    const asNumber = await applyDiscount(publicClient, {
      value: 10_000n,
      duration: Number(ONE_YEAR),
    })
    const asBigint = await applyDiscount(publicClient, {
      value: 10_000n,
      duration: ONE_YEAR,
    })

    expect(typeof asNumber).toBe('bigint')
    expect(asNumber).toBe(asBigint)
  })

  it('discounts longer durations more aggressively than linearly scaling 1y', async () => {
    const oneYear = await applyDiscount(publicClient, {
      value: 10_000n,
      duration: ONE_YEAR,
    })

    const fiveYears = await applyDiscount(publicClient, {
      value: 10_000n * 5n,
      duration: ONE_YEAR * 5n,
    })

    expect(fiveYears).toBeLessThan(oneYear * 5n)
    expect(fiveYears).toBeGreaterThan(0n)
  })

  it('discount is monotonic — longer duration yields ≤ shorter duration at equal value', async () => {
    const at1y = await applyDiscount(publicClient, {
      value: 100_000n,
      duration: ONE_YEAR,
    })
    const at5y = await applyDiscount(publicClient, {
      value: 100_000n,
      duration: ONE_YEAR * 5n,
    })
    const at10y = await applyDiscount(publicClient, {
      value: 100_000n,
      duration: ONE_YEAR * 10n,
    })

    expect(at5y).toBeLessThanOrEqual(at1y)
    expect(at10y).toBeLessThanOrEqual(at5y)
  })
})
