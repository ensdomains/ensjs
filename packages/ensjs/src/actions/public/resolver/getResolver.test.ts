import { numberToHex } from 'viem'
import { describe, expect, it, vi } from 'vitest'
import {
  deploymentAddresses,
  publicClient,
} from '../../../test/addTestContracts.js'
import { getResolver } from './getResolver.js'

describe('getResolver', () => {
  it('should find the resolver for a name with a resolver', async () => {
    const result = await getResolver(publicClient, {
      name: 'with-profile.eth',
    })
    // with-profile.eth is a v1 name pre-migrated onto v2 behind the ENSv1 mirror
    // resolver; getResolver unwraps the composite mirror to the final, writable
    // v1 resolver.
    expect(result).toBe(deploymentAddresses.LegacyPublicResolver)
  })

  it('should run every read at the given blockNumber', async () => {
    const blockNumber = await publicClient.getBlockNumber()
    const requestSpy = vi.spyOn(publicClient, 'request')

    const result = await getResolver(publicClient, {
      name: 'with-profile.eth',
      blockNumber,
    })
    expect(result).toBe(deploymentAddresses.LegacyPublicResolver)

    const ethCalls = (
      requestSpy.mock.calls as unknown as [
        { method: string; params: unknown[] },
      ][]
    )
      .map(([args]) => args)
      .filter(({ method }) => method === 'eth_call')
    // findResolver, supportsInterface and getResolver
    expect(ethCalls).toHaveLength(3)
    for (const { params } of ethCalls)
      expect(params[1]).toBe(numberToHex(blockNumber))

    requestSpy.mockRestore()
  })
})
