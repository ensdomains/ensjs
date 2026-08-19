import { numberToHex } from 'viem'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  deploymentAddresses,
  publicClient,
} from '../../test/addTestContracts.js'
import getResolver from './getResolver.js'

type RequestArguments = {
  method: string
  params?: readonly unknown[]
}

describe('getResolver', () => {
  it('should find the resolver for a name with a resolver', async () => {
    const result = await getResolver(publicClient, { name: 'with-profile.eth' })
    expect(result).toBe(deploymentAddresses.LegacyPublicResolver)
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

      const result = await getResolver(publicClient, {
        name: 'with-profile.eth',
        blockNumber,
      })
      expect(result).toBe(deploymentAddresses.LegacyPublicResolver)

      const ethCallInvocation = requestSpy.mock.calls.find(
        ([{ method }]) => method === 'eth_call',
      )
      expect(ethCallInvocation).toBeDefined()
      const [{ params }] = ethCallInvocation!
      expect(params?.[1]).toBe(numberToHex(blockNumber))
    })
  })
})
