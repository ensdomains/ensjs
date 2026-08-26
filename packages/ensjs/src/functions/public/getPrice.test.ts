import { numberToHex } from 'viem'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { publicClient } from '../../test/addTestContracts.js'
import getPrice from './getPrice.js'

const yearCost = BigInt('8561643835626')

type RequestArguments = {
  method: string
  params?: readonly unknown[]
}

describe('getPrice', () => {
  it('should return a base and premium price for a name', async () => {
    const result = await getPrice(publicClient, {
      nameOrNames: 'test123.eth',
      duration: 86400,
    })
    expect(result).toBeTruthy()
    if (result) {
      const { base, premium } = result
      expect(base).toBe(yearCost)
      expect(premium).toBe(0n)
    }
  })

  it('should return a base and premium price for an array of names', async () => {
    const result = await getPrice(publicClient, {
      nameOrNames: ['test123.eth', 'to-be-renewed.eth'],
      duration: 86400,
    })
    expect(result).toBeTruthy()
    if (result) {
      const { base, premium } = result
      expect(base).toBe(yearCost * 2n)
      expect(premium).toBe(0n)
    }
  })

  it('should allow labels as inputs', async () => {
    const result = await getPrice(publicClient, {
      nameOrNames: 'test123',
      duration: 86400,
    })
    expect(result).toBeTruthy()
    if (result) {
      const { base, premium } = result
      expect(base).toBe(yearCost)
      expect(premium).toBe(0n)
    }
  })

  describe('blockNumber', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should thread blockNumber through to the underlying eth_call', async () => {
      const blockNumber = await publicClient.getBlockNumber()
      const requestSpy = vi.spyOn(publicClient, 'request') as unknown as {
        mock: { calls: [RequestArguments][] }
      }

      const result = await getPrice(publicClient, {
        nameOrNames: 'test123.eth',
        duration: 86400,
        blockNumber,
      })
      expect(result).toBeTruthy()

      const ethCallInvocation = requestSpy.mock.calls.find(
        ([{ method }]) => method === 'eth_call',
      )
      expect(ethCallInvocation).toBeDefined()
      const [{ params }] = ethCallInvocation!
      expect(params?.[1]).toBe(numberToHex(blockNumber))
    })
  })
})
