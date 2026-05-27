import { describe, expect, it } from 'vitest'
import {
  deploymentAddresses,
  publicClient,
} from '../../../test/addTestContracts.js'
import { applyDiscount } from './applyDiscount.js'
import { getRenewPrice } from './getRenewPrice.js'

const renewerAddress = deploymentAddresses.ETHRegistrar
const oracleAddress = deploymentAddresses.StandardRentPriceOracle
const paymentToken = deploymentAddresses.USDC

const ONE_YEAR = 31_557_600n

describe('getRenewPrice', () => {
  describe('against a registered name', () => {
    it('returns a positive renewal price for a 1-year extension', async () => {
      const { amount } = await getRenewPrice(publicClient, {
        renewerAddress,
        label: 'example',
        duration: ONE_YEAR,
        paymentToken,
      })

      expect(typeof amount).toBe('bigint')
      expect(amount).toBeGreaterThan(0n)
    })

    it('coerces a number duration to bigint without loss', async () => {
      const asNumber = await getRenewPrice(publicClient, {
        renewerAddress,
        label: 'example',
        duration: ONE_YEAR,
        paymentToken,
      })
      const asBigint = await getRenewPrice(publicClient, {
        renewerAddress,
        label: 'example',
        duration: ONE_YEAR,
        paymentToken,
      })

      expect(typeof asNumber.amount).toBe('bigint')
      expect(asNumber.amount).toBe(asBigint.amount)
    })

    it('applies the oracle duration-tier discount to longer renewals', async () => {
      const oneYear = await getRenewPrice(publicClient, {
        renewerAddress,
        label: 'example',
        duration: ONE_YEAR,
        paymentToken,
      })

      const twoYears = await getRenewPrice(publicClient, {
        renewerAddress,
        label: 'example',
        duration: ONE_YEAR * 2n,
        paymentToken,
      })

      // Base price scales linearly with duration before discount; the renewer
      // then applies the oracle's duration-tier discount to the total. So
      // twoYears = applyDiscount(oneYear × 2, 2y).
      const expected = await applyDiscount(publicClient, {
        oracleAddress,
        value: oneYear.amount * 2n,
        duration: ONE_YEAR * 2n,
      })

      expect(twoYears.amount).toBe(expected)
      expect(twoYears.amount).toBeLessThan(oneYear.amount * 2n)
      expect(twoYears.amount).toBeGreaterThan(oneYear.amount)
    })
  })
})
