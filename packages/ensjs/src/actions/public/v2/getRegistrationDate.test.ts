import { expect, it } from 'vitest'
import {
  publicClient as client,
  deploymentAddresses,
} from '../../../test/addTestContracts.js'
import { getRegistrationDate } from './getRegistrationDate.js'

it('should return a registration block timestamp for an existing V2 name', async () => {
  const registeredAt = await getRegistrationDate(client, {
    label: 'example',
    registryAddress: deploymentAddresses.ETHRegistry,
  })

  expect(registeredAt).not.toBeNull()
  expect(registeredAt).toBeTypeOf('bigint')
  expect(registeredAt).toBeGreaterThan(0n)
})

it('should return null for a non-existing label', async () => {
  const registeredAt = await getRegistrationDate(client, {
    label: 'thisnamedoesnotexistatallitjustfortest',
    registryAddress: deploymentAddresses.ETHRegistry,
  })

  expect(registeredAt).toEqual(null)
})

it('should return null if there is no register event in a specified block range', async () => {
  const registeredAt = await getRegistrationDate(client, {
    label: 'example',
    registryAddress: deploymentAddresses.ETHRegistry,
    fromBlock: 0n,
    toBlock: 1n,
  })

  expect(registeredAt).toEqual(null)
})
