import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { expect, it } from 'vitest'
import { extendChainWithL2Ens } from '../../../clients/l2.js'
import { getRegistrationDate } from './getRegistrationDate.js'

const client = createPublicClient({
  chain: extendChainWithL2Ens(sepolia),
  transport: http(
    'https://lb.drpc.live/sepolia/AnmpasF2C0JBqeAEzxVO8aRo7Ju0xlER8JS4QmlfqV1j',
  ),
})

it('should return a registration block timestamp for an existing V2 name', async () => {
  const registeredAt = await getRegistrationDate(client, {
    label: 'ens2',
    fromBlock: 9792514n,
  })

  expect(registeredAt).toEqual(1765156836n)
})

it('should return null for a non-existing label', async () => {
  const registeredAt = await getRegistrationDate(client, {
    label: 'thisnamedoesnotexistatallitjustfortest',
  })

  expect(registeredAt).toEqual(null)
})

it('should return null if there is no register event in a specified block range', async () => {
  const registeredAt = await getRegistrationDate(client, {
    label: 'ens2',
    fromBlock: 9592514n,
    toBlock: 9592614n,
  })

  expect(registeredAt).toEqual(null)
})
