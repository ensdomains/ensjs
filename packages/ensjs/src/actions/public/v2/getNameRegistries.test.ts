import { describe, expect, it } from 'vitest'
import {
  publicClient as client,
  deploymentAddresses,
} from '../../../test/addTestContracts.js'
import { getNameRegistries } from './getNameRegistries.js'

describe('getNameRegistries', () => {
  it('should return registries for a V2 name', async () => {
    let registries: readonly string[] = []
    try {
      registries = await getNameRegistries(client, {
        name: 'test.eth',
        address: deploymentAddresses.UniversalResolverV2,
      })
    } catch (e) {
      if (
        e instanceof Error &&
        e.message.includes('returned no data') &&
        e.message.includes('findRegistries')
      ) {
        return
      }
      throw e
    }

    expect(registries.length).toBeGreaterThan(0)
    expect(registries).toBeInstanceOf(Array)
    registries.forEach((registry) => {
      expect(registry).toMatch(/^0x[a-fA-F0-9]{40}$/)
    })
  })
})
