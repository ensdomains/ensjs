import { createPublicClient, custom, numberToHex } from 'viem'
import { describe, expect, it } from 'vitest'
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
    // Record at the transport: viem binds actions to the pre-extend client,
    // so spying on `publicClient.request` never sees these calls.
    const ethCalls: unknown[][] = []
    const client = createPublicClient({
      chain: publicClient.chain,
      transport: custom({
        request: ({ method, params }) => {
          if (method === 'eth_call') ethCalls.push(params)
          return publicClient.request({ method, params } as never)
        },
      }),
    })

    const result = await getResolver(client, {
      name: 'with-profile.eth',
      blockNumber,
    })
    expect(result).toBe(deploymentAddresses.LegacyPublicResolver)

    // findResolver, supportsInterface and getResolver
    expect(ethCalls).toHaveLength(3)
    for (const params of ethCalls)
      expect(params[1]).toBe(numberToHex(blockNumber))
  })
})
