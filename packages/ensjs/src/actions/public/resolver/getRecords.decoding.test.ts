import {
  publicResolverAbiSnippet,
  publicResolverTextSnippet,
} from '@ensdomains/ensjs-abi/v1/publicResolver'
import { createPublicClient, encodeFunctionResult, type Hex, http } from 'viem'
import { mainnet } from 'viem/chains'
import { describe, expect, it } from 'vitest'
import { addEnsContracts } from '../../../index.js'
import { getRecords } from './getRecords.js'

const resolverAddress = '0x1234567890123456789012345678901234567890'
const resolverPaths = [
  { path: 'direct resolver', resolver: { address: resolverAddress } },
  { path: 'universal resolver', resolver: undefined },
] as const

// Stub resolver responses while exercising the real record decoding and aggregation.
const createClient = (decodedData: readonly [bigint, Hex]) =>
  Object.assign(
    createPublicClient({ chain: addEnsContracts(mainnet), transport: http() }),
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

describe('getRecords ABI failure handling', () => {
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
