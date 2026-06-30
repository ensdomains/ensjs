import { describe, expect, it } from 'vitest'
import {
  deploymentAddresses,
  publicClient,
} from '../../test/addTestContracts.js'
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
})
