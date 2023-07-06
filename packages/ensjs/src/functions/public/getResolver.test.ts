import {
  deploymentAddresses,
  publicClient,
} from '../../tests/addTestContracts.js'
import getResolver from './getResolver.js'

describe('getResolver', () => {
  it('should find the resolver for a name with a resolver', async () => {
    const result = await getResolver(publicClient, { name: 'with-profile.eth' })
    expect(result).toBe(deploymentAddresses.LegacyPublicResolver)
  })
})
