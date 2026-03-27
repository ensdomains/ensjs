import { expect, it } from 'vitest'
import { UnsupportedNameTypeError } from '../../../errors/general.js'
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

it('should throw for a non-.eth name', async () => {
  await expect(
    getExpiry(client, {
      name: 'test.com',
      registryAddress: deploymentAddresses.ETHRegistry,
    }),
  ).rejects.toThrowError(UnsupportedNameTypeError)
})

