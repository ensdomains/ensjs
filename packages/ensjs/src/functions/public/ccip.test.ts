import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { describe, expect, it, vi } from 'vitest'
import { addEnsContracts } from '../../contracts/addEnsContracts.js'
import { ccipRequest } from '../../utils/ccipRequest.js'
import batch from './batch.js'
import getAddressRecord from './getAddressRecord.js'
import getRecords from './getRecords.js'
// import getText from './getTextRecord.js'

vi.setConfig({
  testTimeout: 30000,
})

const mainnetPublicClient = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http('https://mainnet.gateway.tenderly.co/4imxc4hQfRjxrVB2kWKvTo'),
})

describe('CCIP', () => {
  describe('getRecords', () => {
    it('should return records from a ccip-read name', async () => {
      const result = await getRecords(mainnetPublicClient, {
        name: 'sg.offchaindemo.eth',
        // texts: ['email', 'description'],
        // contentHash: true,
        coins: ['60'],
      })
      expect(result).toMatchInlineSnapshot(`
        {
          "coins": [
            {
              "id": 60,
              "name": "eth",
              "value": "0x80c5657CEE59A5a193EfDCfDf3D3913Fad977B61",
            },
          ],
          "resolverAddress": "0xDB34Da70Cfd694190742E94B7f17769Bc3d84D27",
        }
      `)
    })
    it('should return records from a ccip-read name with custom ccipRequest', async () => {
      const goerliWithEns = addEnsContracts(mainnet)
      const goerliPublicClientWithCustomCcipRequest = createPublicClient({
        chain: goerliWithEns,
        transport: http(
          'https://mainnet.gateway.tenderly.co/4imxc4hQfRjxrVB2kWKvTo',
        ),
        ccipRead: {
          request: ccipRequest(goerliWithEns),
        },
      })
      const result = await getRecords(goerliPublicClientWithCustomCcipRequest, {
        name: 'sg.offchaindemo.eth',
        coins: ['60'],
      })
      expect(result).toMatchInlineSnapshot(`
        {
          "coins": [
            {
              "id": 60,
              "name": "eth",
              "value": "0x80c5657CEE59A5a193EfDCfDf3D3913Fad977B61",
            },
          ],
          "resolverAddress": "0xDB34Da70Cfd694190742E94B7f17769Bc3d84D27",
        }
      `)
    })
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
              "id": 60,
              "name": "eth",
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
  describe('batch', () => {
    it('allows batch ccip', async () => {
      const result = await batch(
        mainnetPublicClient,
        getAddressRecord.batch({ name: 'sg.offchaindemo.eth' }),
        getAddressRecord.batch({ name: 'sg.offchaindemo.eth', coin: '60' }),
        // getText.batch({ name: '1.offchainexample.eth', key: 'email' }),
      )
      expect(result).toMatchInlineSnapshot(`
        [
          {
            "id": 60,
            "name": "eth",
            "value": "0x80c5657CEE59A5a193EfDCfDf3D3913Fad977B61",
          },
          {
            "id": 60,
            "name": "eth",
            "value": "0x80c5657CEE59A5a193EfDCfDf3D3913Fad977B61",
          },
        ]
      `)
    })
    it('allows nested batch ccip', async () => {
      const result = await batch(
        mainnetPublicClient,
        batch.batch(getAddressRecord.batch({ name: 'sg.offchaindemo.eth' })),
      )
      expect(result).toMatchInlineSnapshot(`
        [
          [
            {
              "id": 60,
              "name": "eth",
              "value": "0x80c5657CEE59A5a193EfDCfDf3D3913Fad977B61",
            },
          ],
        ]
      `)
    })
  })
})
