import { describe, expect, it } from 'vitest'
import {
  deploymentAddresses,
  publicClient,
} from '../../../test/addTestContracts.js'
import { isPaymentToken } from './isPaymentToken.js'

describe('isPaymentToken', () => {
  it.each([
    ['USDC', deploymentAddresses.USDC],
    ['DAI', deploymentAddresses.DAI],
  ] as const)(
    'returns true for a configured payment token (%s)',
    async (_, paymentToken) => {
      const result = await isPaymentToken(publicClient, { paymentToken })

      expect(result).toBe(true)
    },
  )

  it.each([
    ['zero address', '0x0000000000000000000000000000000000000000'],
    [
      'arbitrary unsupported address',
      '0x0000000000000000000000000000000000000001',
    ],
    ['registrar address (not an ERC-20)', deploymentAddresses.ETHRegistrar],
  ] as const)('returns false for %s', async (_, paymentToken) => {
    const result = await isPaymentToken(publicClient, {
      paymentToken,
    })

    expect(result).toBe(false)
  })
})
