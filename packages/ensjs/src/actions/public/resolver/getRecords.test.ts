import {
  publicResolverAbiSnippet,
  publicResolverTextSnippet,
} from '@ensdomains/ensjs-abi/v1/publicResolver'
import { createPublicClient, encodeFunctionResult, type Hex, http } from 'viem'
import { mainnet } from 'viem/chains'
import { describe, expect, it } from 'vitest'
import { addEnsContracts } from '../../../index.js'
import { publicClient } from '../../../test/addTestContracts.js'
import { getRecords } from './getRecords.js'

const mainnetPublicClient = createPublicClient({
  chain: addEnsContracts(mainnet),
  transport: http('https://mainnet.gateway.tenderly.co/4imxc4hQfRjxrVB2kWKvTo'),
})

describe('getRecords()', () => {
  it('works', async () => {
    const result = await getRecords(publicClient, {
      name: 'with-profile.eth',
      texts: ['description', 'url'],
      coins: ['60', 'etcLegacy', '0'],
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "coins": [
          {
            "coinType": 60,
            "symbol": "eth",
            "value": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          },
          {
            "coinType": 61,
            "symbol": "etcLegacy",
            "value": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          },
        ],
        "resolverAddress": "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
        "texts": [
          {
            "key": "description",
            "value": "Hello2",
          },
        ],
      }
    `)
  })
  it('works with oldest resolver', async () => {
    const result = await getRecords(publicClient, {
      name: 'with-oldest-resolver.eth',
      texts: ['description', 'url'],
      coins: ['60', 'etcLegacy', '0'],
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "coins": [],
        "resolverAddress": "0x0000000000000000000000000000000000000000",
        "texts": [],
      }
    `)
  })
  it('works with oldest resolver - jessesum.eth', async () => {
    const result = await getRecords(mainnetPublicClient, {
      name: 'jessesum.eth',
      texts: ['description', 'url'],
      coins: ['60', 'etcLegacy', '0'],
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "coins": [
          {
            "coinType": 60,
            "symbol": "eth",
            "value": "0x8c4Eb6988A199DAbcae0Ce31052b3f3aC591787e",
          },
        ],
        "resolverAddress": "0x1da022710dF5002339274AaDEe8D58218e9D6AB5",
        "texts": [],
      }
    `)
  })

  it('returns null results when known resolver error', async () => {
    const result = await getRecords(publicClient, {
      name: 'thisnamedoesnotexist.eth',
      coins: [60],
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "coins": [],
        "resolverAddress": "0x0000000000000000000000000000000000000000",
      }
    `)
  })

  describe('ABI failure handling', () => {
    const resolverAddress = '0x1234567890123456789012345678901234567890'
    const resolverPaths = [
      { path: 'direct resolver', resolver: { address: resolverAddress } },
      { path: 'universal resolver', resolver: undefined },
    ] as const

    // Stub resolver responses while exercising the real record decoding and aggregation.
    const createClient = (decodedData: readonly [bigint, Hex]) =>
      Object.assign(
        createPublicClient({
          chain: addEnsContracts(mainnet),
          transport: http(),
        }),
        {
          multicall: async () => [
            { status: 'success', result: 'Avatar survives' },
            { status: 'success', result: decodedData },
          ],
          resolveNameData: async () => ({
            resolverAddress,
            resolvedData: [
              {
                success: true,
                returnData: encodeFunctionResult({
                  abi: publicResolverTextSnippet,
                  functionName: 'text',
                  result: 'Avatar survives',
                }),
              },
              {
                success: true,
                returnData: encodeFunctionResult({
                  abi: publicResolverAbiSnippet,
                  functionName: 'ABI',
                  result: decodedData,
                }),
              },
            ],
          }),
        },
      )

    it.each(resolverPaths)(
      'preserves text records when ABI decoding fails through $path',
      async ({ resolver }) => {
        for (const [contentType, data] of [
          [1n, '0x1234'],
          [4n, '0xbf'],
          [4n, '0x9affffffff'],
        ] as const) {
          await expect(
            getRecords(createClient([contentType, data]), {
              name: 'gift.eth',
              texts: ['avatar'],
              abi: true,
              resolver,
            }),
          ).resolves.toEqual({
            resolverAddress,
            texts: [{ key: 'avatar', value: 'Avatar survives' }],
            abi: null,
          })
        }
      },
    )

    it.each(resolverPaths)(
      'preserves valid ABI records through $path',
      async ({ resolver }) => {
        await expect(
          getRecords(createClient([4n, '0x81a0']), {
            name: 'gift.eth',
            texts: ['avatar'],
            abi: true,
            resolver,
          }),
        ).resolves.toEqual({
          resolverAddress,
          texts: [{ key: 'avatar', value: 'Avatar survives' }],
          abi: { contentType: 4, decoded: true, abi: [{}] },
        })
      },
    )
  })
})
