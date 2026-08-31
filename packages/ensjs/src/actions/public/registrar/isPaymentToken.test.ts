import { describe, expect, it } from 'vitest'
import {
  deploymentAddresses,
  publicClient,
} from '../../../test/addTestContracts.js'
import { isPaymentToken } from './isPaymentToken.js'

describe('isPaymentToken', () => {
  it('returns true for a configured payment token (USDC)', async () => {
    const result = await isPaymentToken(publicClient, {
      paymentToken: deploymentAddresses.USDC,
    })

    expect(result).toBe(true)
  })

  it.each([
    ['zero address', '0x0000000000000000000000000000000000000000'],
    [
      'arbitrary unsupported address',
      '0x0000000000000000000000000000000000000001',
    ],
    ['registrar address (not an ERC-20)', deploymentAddresses.ETHRegistrar],
    ['ERC-20 deployed but not configured (DAI)', deploymentAddresses.DAI],
  ] as const)('returns false for %s', async (_, paymentToken) => {
    const result = await isPaymentToken(publicClient, {
      paymentToken,
    })

    expect(result).toBe(false)
  })
})
