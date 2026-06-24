import { http, type PublicClient, createPublicClient, toHex, parseAbi } from 'viem'
import { sepolia, mainnet } from 'viem/chains'
import { describe, expect, it, vi } from 'vitest'
import { addEnsContracts } from '../../contracts/addEnsContracts.js'
import { erc165SupportsInterfaceSnippet } from '../../contracts/erc165.js'
import { ccipRequest } from '../../utils/ccipRequest.js'
import { packetToBytes } from '../../utils/hexEncodedName.js'
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

// Temporary patch: on sepolia, old .eth names are reached via an ENSV1Resolver
// shim that wraps the underlying resolver. Unwrap it so the snapshots compare
// against the real underlying resolver address.
const unwrapSepoliaV1Resolver = async (
  client: PublicClient,
  name: string,
  resolverAddress: `0x${string}`,
): Promise<`0x${string}`> => {
  const supports = await client
    .readContract({
      address: resolverAddress,
      abi: erc165SupportsInterfaceSnippet,
      functionName: 'supportsInterface',
      args: ['0xeea330f9'], // getResolver(bytes) selector
    })
    .catch(() => false)

  if (!supports) return resolverAddress

  return client.readContract({
    address: resolverAddress,
    abi: parseAbi(['function getResolver(bytes) returns (address)']),
    functionName: 'getResolver',
    args: [toHex(packetToBytes(name))],
  })
}

describe('CCIP', () => {
  describe('getRecords', () => {
    it('should return records from a ccip-read name', async () => {
      const result = await getRecords(sepoliaPublicClient, {
        name: 'gregskril.eth',
        texts: ['email', 'avatar'],
        contentHash: true,
        coins: ['btc', '60'],
      })
      result.resolverAddress = await unwrapSepoliaV1Resolver(
        sepoliaPublicClient,
        'gregskril.eth',
        result.resolverAddress,
      )
      expect(result).toMatchInlineSnapshot(`
        {
          "coins": [
            {
              "id": 60,
              "name": "eth",
              "value": "0x179A862703a4adfb29896552DF9e307980D19285",
            },
          ],
          "contentHash": {
            "decoded": "bafybeifgil7fclzl5nsmikh6ml6lwphs3vrandqwhkm6d73yos2fb7a36y",
            "protocolType": "ipfs",
          },
          "resolverAddress": "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD",
          "texts": [
            {
              "key": "avatar",
              "value": "https://euc.li/sepolia/gregskril.eth",
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
          name: 'gregskril.eth',
          texts: ['email', 'avatar'],
          contentHash: true,
          coins: ['btc', '60'],
        },
      )
      result.resolverAddress = await unwrapSepoliaV1Resolver(
        sepoliaPublicClient,
        'gregskril.eth',
        result.resolverAddress,
      )
      expect(result).toMatchInlineSnapshot(`
      {
        "coins": [
          {
            "id": 60,
            "name": "eth",
            "value": "0x179A862703a4adfb29896552DF9e307980D19285",
          },
        ],
        "contentHash": {
          "decoded": "bafybeifgil7fclzl5nsmikh6ml6lwphs3vrandqwhkm6d73yos2fb7a36y",
          "protocolType": "ipfs",
        },
        "resolverAddress": "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD",
        "texts": [
          {
            "key": "avatar",
            "value": "https://euc.li/sepolia/gregskril.eth",
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
        getAddressRecord.batch({ name: 'gregskril.eth' }),
        getAddressRecord.batch({ name: 'gregskril.eth', coin: 'btc' }),
        getText.batch({ name: 'gregskril.eth', key: 'avatar' }),
      )
      expect(result).toMatchInlineSnapshot(`
      [
        {
          "id": 60,
          "name": "eth",
          "value": "0x179A862703a4adfb29896552DF9e307980D19285",
        },
        null,
        "https://euc.li/sepolia/gregskril.eth",
      ]
      `)
    })
    it('allows nested batch ccip', async () => {
      const result = await batch(
        sepoliaPublicClient,
        batch.batch(getAddressRecord.batch({ name: 'gregskril.eth' })),
      )
      expect(result).toMatchInlineSnapshot(`
        [
          [
            {
              "id": 60,
              "name": "eth",
              "value": "0x179A862703a4adfb29896552DF9e307980D19285",
            },
          ],
        ]
      `)
    })
  })
})
