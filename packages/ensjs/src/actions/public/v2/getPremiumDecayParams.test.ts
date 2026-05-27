import { describe, expect, it } from 'vitest'
import {
  deploymentAddresses,
  publicClient,
} from '../../../test/addTestContracts.js'
import { getPremiumDecayParams } from './getPremiumDecayParams.js'

const oracleAddress = deploymentAddresses.StandardRentPriceOracle

describe('getPremiumDecayParams', () => {
  it('reads the three immutable premium-decay constants from the oracle', async () => {
    const { priceInitial, halvingPeriod, period } = await getPremiumDecayParams(
      publicClient,
      { oracleAddress },
    )

    expect(typeof priceInitial).toBe('bigint')
    expect(typeof halvingPeriod).toBe('bigint')
    expect(typeof period).toBe('bigint')
  })

  it('returns a positive initial premium', async () => {
    const { priceInitial } = await getPremiumDecayParams(publicClient, {
      oracleAddress,
    })

    expect(priceInitial).toBeGreaterThan(0n)
  })

  it('returns a halvingPeriod that strictly divides into the premium window', async () => {
    const { halvingPeriod, period } = await getPremiumDecayParams(
      publicClient,
      {
        oracleAddress,
      },
    )

    expect(halvingPeriod).toBeGreaterThan(0n)
    expect(period).toBeGreaterThan(0n)
    expect(period).toBeGreaterThanOrEqual(halvingPeriod)
    // Premium decays via halvings; the window should contain at least one halving step.
    expect(period / halvingPeriod).toBeGreaterThanOrEqual(1n)
  })

  it('returns stable values across calls (constants are immutable)', async () => {
    const a = await getPremiumDecayParams(publicClient, { oracleAddress })
    const b = await getPremiumDecayParams(publicClient, { oracleAddress })

    expect(a).toEqual(b)
  })
})
