import { deploymentAddresses, publicClient } from '../../tests/addTestContracts'
import getSubgraphRegistrant from './getSubgraphRegistrant'

it('gets the registrant for a 2ld .eth name', async () => {
  const result = await getSubgraphRegistrant(publicClient, {
    name: 'wrapped.eth',
  })
  expect(result).toBe(deploymentAddresses.NameWrapper)
})
it('returns null for nonexistent name', async () => {
  const result = await getSubgraphRegistrant(publicClient, {
    name: 'unregistered.eth',
  })
  expect(result).toBeNull()
})
it('throws an error for other name', async () => {
  await expect(
    getSubgraphRegistrant(publicClient, {
      name: 'test123.com',
    }),
  ).rejects.toThrow('Registrant can only be fetched for 2ld .eth names')
})
