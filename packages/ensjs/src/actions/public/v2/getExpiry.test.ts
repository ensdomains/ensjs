import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { expect, it } from 'vitest'
import { extendChainWithL2Ens } from '../../../clients/l2.js'
import { getExpiry } from './getExpiry.js'

const client = createPublicClient({
  chain: extendChainWithL2Ens(sepolia),
  transport: http('https://sepolia.gateway.tenderly.co/6kJhxsvOStaVLCY9oRkD9z'),
})

it('should return non-zero expiry for a V2 name', async () => {
  const expiry = await getExpiry(client, { name: 'ens2.eth' })

  expect(expiry > 0).toEqual(true)
})
