import { expect, it } from 'vitest'
import { publicClientL2 as client } from '../../../test/addTestContracts.js'
import { getRegistrationDate } from './getRegistrationDate.js'

it.skip('should return a registration block timestamp for an existing V2 name', async () => {
  // TODO: Register a test name on L2 first, then test retrieval
  const registeredAt = await getRegistrationDate(client, {
    label: 'testname',
    fromBlock: 0n,
  })

  expect(registeredAt).not.toBeNull()
})

it('should return null for a non-existing label', async () => {
  const registeredAt = await getRegistrationDate(client, {
    label: 'thisnamedoesnotexistatallitjustfortest',
  })

  expect(registeredAt).toEqual(null)
})

it.skip('should return null if there is no register event in a specified block range', async () => {
  // TODO: Register a test name on L2 first, then test with restricted block range
  const registeredAt = await getRegistrationDate(client, {
    label: 'testname',
    fromBlock: 0n,
    toBlock: 1n,
  })

  expect(registeredAt).toEqual(null)
})
