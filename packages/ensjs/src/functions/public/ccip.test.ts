import { http, createPublicClient } from 'viem'
import { holesky, mainnet } from 'viem/chains'
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

const holeskyPublicClient = createPublicClient({
  chain: addEnsContracts(holesky),
  transport: http('https://holesky.gateway.tenderly.co/5S00ox7ZN3mdGqaO74UDsg'),
})

describe('CCIP', () => {
  describe('getRecords', () => {
    it('should return records from a ccip-read name', async () => {
      const result = await getRecords(holeskyPublicClient, {
        name: 'offchainexample.eth',
        texts: ['email', 'description'],
        contentHash: true,
        coins: ['btc', '60'],
      })
      expect(result).toMatchInlineSnapshot(`
        {
          "coins": [
            {
              "id": 0,
              "name": "btc",
              "value": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
            },
            {
              "id": 60,
              "name": "eth",
              "value": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
            },
          ],
          "contentHash": {
            "decoded": "bafybeico3uuyj3vphxpvbowchdwjlrlrh62awxscrnii7w7flu5z6fk77y",
            "protocolType": "ipfs",
          },
          "resolverAddress": "0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547",
          "texts": [
            {
              "key": "email",
              "value": "vitalik@ethereum.org",
            },
            {
              "key": "description",
              "value": "hello offchainresolver record",
            },
          ],
        }
      `)
    })
    it('should return records from a ccip-read name with custom ccipRequest', async () => {
      const holeskyWithEns = addEnsContracts(holesky)
      const holeskyPublicClientWithCustomCcipRequest = createPublicClient({
        chain: holeskyWithEns,
        transport: http('https://holesky.gateway.tenderly.co'),
        ccipRead: {
          request: ccipRequest(holeskyWithEns),
        },
      })
      const result = await getRecords(
        holeskyPublicClientWithCustomCcipRequest,
        {
          name: 'offchainexample.eth',
          texts: ['email', 'description'],
          contentHash: true,
          coins: ['btc', '60'],
        },
      )
      expect(result).toMatchInlineSnapshot(`
      {
        "coins": [
          {
            "id": 0,
            "name": "btc",
            "value": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
          },
          {
            "id": 60,
            "name": "eth",
            "value": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
          },
        ],
        "contentHash": {
          "decoded": "bafybeico3uuyj3vphxpvbowchdwjlrlrh62awxscrnii7w7flu5z6fk77y",
          "protocolType": "ipfs",
        },
        "resolverAddress": "0x59E16fcCd424Cc24e280Be16E11Bcd56fb0CE547",
        "texts": [
          {
            "key": "email",
            "value": "vitalik@ethereum.org",
          },
          {
            "key": "description",
            "value": "hello offchainresolver record",
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
        holeskyPublicClient,
        getAddressRecord.batch({ name: 'offchainexample.eth' }),
        getAddressRecord.batch({ name: 'offchainexample.eth', coin: 'btc' }),
        getText.batch({ name: 'offchainexample.eth', key: 'email' }),
      )
      expect(result).toMatchInlineSnapshot(`
      [
        {
          "id": 60,
          "name": "eth",
          "value": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        },
        {
          "id": 0,
          "name": "btc",
          "value": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        },
        "vitalik@ethereum.org",
      ]
      `)
    })
    it('allows nested batch ccip', async () => {
      const result = await batch(
        holeskyPublicClient,
        batch.batch(getAddressRecord.batch({ name: 'offchainexample.eth' })),
      )
      expect(result).toMatchInlineSnapshot(`
        [
          [
            {
              "id": 60,
              "name": "eth",
              "value": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
            },
          ],
        ]
      `)
    })
  })
})
