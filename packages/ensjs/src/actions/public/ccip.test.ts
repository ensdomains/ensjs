import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { describe, expect, it, vi } from 'vitest'
import { addEnsL1Contracts } from '../../index.js'
import { getRecords } from './resolver/getRecords.js'

vi.setConfig({
  testTimeout: 30000,
})

const mainnetPublicClient = createPublicClient({
  chain: addEnsL1Contracts(mainnet),
  transport: http('https://mainnet.gateway.tenderly.co/4imxc4hQfRjxrVB2kWKvTo'),
})

describe('CCIP', () => {
  describe('getRecords', () => {
    it('should return records from a ccip-read name with incompliant resolver', async () => {
      const result = await getRecords(mainnetPublicClient, {
        name: 'taytems.xyz',
        texts: ['email', 'description'],
        contentHash: true,
        coins: ['ltc', '60'],
      })
      expect(result).toMatchInlineSnapshot(`
        {
          "coins": [
            {
              "coinType": 60,
              "symbol": "eth",
              "value": "0x8e8Db5CcEF88cca9d624701Db544989C996E3216",
            },
          ],
          "contentHash": null,
          "resolverAddress": "0xF142B308cF687d4358410a4cB885513b30A42025",
          "texts": [],
        }
      `)
    })
  })
})
