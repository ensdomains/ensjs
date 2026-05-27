import { http, createPublicClient } from 'viem'
import { sepolia, mainnet } from 'viem/chains'
import { describe, expect, it, vi } from 'vitest'
import { addEnsContracts } from '../../contracts/addEnsContracts.js'
import { ccipRequest } from '../../utils/ccipRequest.js'
import batch from './batch.js'
import getAddressRecord from './getAddressRecord.js'
import getRecords from './getRecords.js'
import getText from './getTextRecord.js'

vi.setConfig({
  testTimeout: 30000,
})

const mainnetPublicClient = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http('https://mainnet.gateway.tenderly.co/4imxc4hQfRjxrVB2kWKvTo'),
})

const sepoliaPublicClient = createPublicClient({
  chain: addEnsContracts(sepolia),
  transport: http('https://sepolia.gateway.tenderly.co'),
})

describe('CCIP', () => {
  describe('getRecords', () => {
    it('should return records from a ccip-read name', async () => {
      const result = await getRecords(sepoliaPublicClient, {
        name: 'testing.ethbuc.eth',
        texts: ['email', 'description'],
        contentHash: true,
        coins: ['btc', '60'],
      })
      expect(result).toMatchInlineSnapshot(`
        {
          "coins": [
            {
              "id": 60,
              "name": "eth",
              "value": "0xb6B8B9dD5Ad1582f854bB7e7CBE49B9E4EC60eb7",
            },
          ],
          "contentHash": null,
          "resolverAddress": "0x7DbcFF94B5b9ccdf2B21f60Ef1F19A566016636B",
          "texts": [
            {
              "key": "description",
              "value": "my first profile",
            },
          ],
        }
      `)
    })
    it('should return records from a ccip-read name with custom ccipRequest', async () => {
      const sepoliaWithEns = addEnsContracts(sepolia)
      const sepoliaPublicClientWithCustomCcipRequest = createPublicClient({
        chain: sepoliaWithEns,
        transport: http('https://sepolia.gateway.tenderly.co'),
        ccipRead: {
          request: ccipRequest(sepoliaWithEns),
        },
      })
      const result = await getRecords(
        sepoliaPublicClientWithCustomCcipRequest,
        {
          name: 'testing.ethbuc.eth',
          texts: ['email', 'description'],
          contentHash: true,
          coins: ['btc', '60'],
        },
      )
      expect(result).toMatchInlineSnapshot(`
      {
        "coins": [
          {
            "id": 60,
            "name": "eth",
            "value": "0xb6B8B9dD5Ad1582f854bB7e7CBE49B9E4EC60eb7",
          },
        ],
        "contentHash": null,
        "resolverAddress": "0x7DbcFF94B5b9ccdf2B21f60Ef1F19A566016636B",
        "texts": [
          {
            "key": "description",
            "value": "my first profile",
          },
        ],
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
        sepoliaPublicClient,
        getAddressRecord.batch({ name: 'testing.ethbuc.eth' }),
        getAddressRecord.batch({ name: 'testing.ethbuc.eth', coin: 'btc' }),
        getText.batch({ name: 'testing.ethbuc.eth', key: 'description' }),
      )
      expect(result).toMatchInlineSnapshot(`
      [
        {
          "id": 60,
          "name": "eth",
          "value": "0xb6B8B9dD5Ad1582f854bB7e7CBE49B9E4EC60eb7",
        },
        null,
        "my first profile",
      ]
      `)
    })
    it('allows nested batch ccip', async () => {
      const result = await batch(
        sepoliaPublicClient,
        batch.batch(getAddressRecord.batch({ name: 'testing.ethbuc.eth' })),
      )
      expect(result).toMatchInlineSnapshot(`
        [
          [
            {
              "id": 60,
              "name": "eth",
              "value": "0xb6B8B9dD5Ad1582f854bB7e7CBE49B9E4EC60eb7",
            },
          ],
        ]
      `)
    })
  })
})
