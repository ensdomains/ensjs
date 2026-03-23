import { expect, it } from 'vitest'
import {
  publicClient as client,
  deploymentAddresses,
} from '../../../test/addTestContracts.js'
import { getExpiry } from './getExpiry.js'

it('should return non-zero expiry for a V2 name', async () => {
  const expiry = await getExpiry(client, {
    name: 'parent.eth',
    registryAddress: deploymentAddresses.ETHRegistry,
  })

  expect(expiry > 0n).toEqual(true)
})
