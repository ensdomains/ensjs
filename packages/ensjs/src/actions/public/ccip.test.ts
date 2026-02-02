import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { describe, expect, it, vi } from 'vitest'
import { addEnsL1Contracts } from '../../index.js'
import { getRecords } from './getRecords.js'

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
        name: 'alisha.beam.eco',
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
              "value": "0x3A8C8D374AD15fE43E6239F6C694bff9Ee4CBbbf",
            },
          ],
          "contentHash": null,
          "resolverAddress": "0x244fE34a508E16E12A221332f63E3a741C759D76",
          "texts": [],
        }
      `)
    })
  })
})
