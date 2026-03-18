import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { describe, expect, it } from 'vitest'
import { extendChainWithEns } from '../../../clients/l1.js'
import { getNameRegistries } from './getNameRegistries.js'

const client = createPublicClient({
  chain: extendChainWithEns(sepolia),
  transport: http(
    'https://lb.drpc.live/sepolia/AnmpasF2C0JBqeAEzxVO8aRo7Ju0xlER8JS4QmlfqV1j',
  ),
})

describe('getNameRegistries', () => {
  it('should return registries for a V2 name', async () => {
    const registries = await getNameRegistries(client, { name: 'fresh.eth' })

    expect(registries.length).toBeGreaterThan(0)
    expect(registries).toBeInstanceOf(Array)
    registries.forEach((registry) => {
      expect(registry).toMatch(/^0x[a-fA-F0-9]{40}$/)
    })
  })
})
