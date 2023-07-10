import { getVersion } from '../../errors/error-utils.js'
import {
  deploymentAddresses,
  publicClient,
} from '../../tests/addTestContracts.js'
import getSubgraphRegistrant from './getSubgraphRegistrant.js'

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
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "Unsupported name type: other-2ld

    - Supported name types: eth-2ld

    Details: Registrant can only be fetched for eth-2ld names

    Version: ${getVersion()}"
  `)
})
