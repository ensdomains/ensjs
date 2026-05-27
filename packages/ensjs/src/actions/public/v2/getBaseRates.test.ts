import { describe, expect, it } from 'vitest'
import {
  deploymentAddresses,
  publicClient,
} from '../../../test/addTestContracts.js'
import { getBaseRates } from './getBaseRates.js'

const oracleAddress = deploymentAddresses.StandardRentPriceOracle

// Pinned base-rate table from the devnet StandardRentPriceOracle deployment.
// Array is indexed by `label length - 1`; lengths 1-2 return 0 (oracle
// rejects labels shorter than 3 chars). Lengths beyond the table clamp to
// the tail entry.
const EXPECTED_RATES = [
  0n, // length 1
  0n, // length 2
  20_280_377n, // length 3
  5_070_095n, // length 4
  253_505n, // length 5+ (clamps)
] as const

describe('getBaseRates', () => {
  it('returns the pinned per-length base-rate table from the oracle', async () => {
    const rates = await getBaseRates(publicClient, { oracleAddress })

    expect(rates).toEqual(EXPECTED_RATES)
  })

  it('returns rates that are monotonically non-increasing across the valid (3+ char) range', async () => {
    const rates = await getBaseRates(publicClient, { oracleAddress })

    for (let i = 3; i < rates.length; i++) {
      expect(rates[i]).toBeLessThanOrEqual(rates[i - 1])
    }
  })

  it('returns zero rates for the two sub-3-character slots and positive thereafter', async () => {
    const rates = await getBaseRates(publicClient, { oracleAddress })

    expect(rates[0]).toBe(0n) // length 1
    expect(rates[1]).toBe(0n) // length 2
    for (let i = 2; i < rates.length; i++) {
      expect(rates[i]).toBeGreaterThan(0n)
    }
  })
})
