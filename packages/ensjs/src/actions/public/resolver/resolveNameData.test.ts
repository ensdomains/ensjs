import { multicallSnippet } from '@ensdomains/ensjs-abi/multicall'
import {
  universalResolverResolveSnippet,
  universalResolverResolveWithGatewaysSnippet,
} from '@ensdomains/ensjs-abi/universalResolver'
import {
  publicResolverSingleAddrSnippet,
  publicResolverTextSnippet,
} from '@ensdomains/ensjs-abi/v1/publicResolver'
import {
  BaseError,
  type Client,
  ContractFunctionRevertedError,
  encodeErrorResult,
  encodeFunctionData,
  encodeFunctionResult,
  namehash,
  type PublicClient,
  type Transport,
  toHex,
  zeroAddress,
} from 'viem'
import { mainnet } from 'viem/chains'
import { packetToBytes } from 'viem/ens'
import { beforeEach, expect, it, type MockedFunction, vi } from 'vitest'
import type { ChainWithContracts } from '../../../clients/chain.js'
import { addEnsContracts } from '../../../index.js'
import {
  getAddressParameters,
  getTextParameters,
} from '../../../utils/index.js'
import { resolveNameData } from './resolveNameData.js'

const mockReadContract = vi.fn() as MockedFunction<PublicClient['readContract']>
const mockClient = {
  readContract: mockReadContract,
  chain: addEnsContracts(mainnet),
} as unknown as Client<Transport, ChainWithContracts<'ensUniversalResolver'>>

beforeEach(() => {
  vi.clearAllMocks()
})

it('encodes labels larger than 255 bytes', async () => {
  await resolveNameData(mockClient, {
    name: `${'a'.repeat(300)}.eth`,
    data: '0x',
  }).catch(() => {})
  const [{ args }] = mockReadContract.mock.calls[0]
  expect(args?.[0]).toBe(
    toHex(
      packetToBytes(
        '[5b7e0e47a96f32a88b4f14ca177982790807c40e1a105742ba0fc1babe1ef826].eth',
      ),
    ),
  )
})

it('uses gateways abi when gateways are provided', async () => {
  await resolveNameData(mockClient, {
    name: 'test.eth',
    data: '0x',
    gatewayUrls: ['https://gateway.example.com'],
  }).catch(() => {})
  const [{ abi }] = mockReadContract.mock.calls[0]
  expect(abi).toBe(universalResolverResolveWithGatewaysSnippet)
})

it('does not throw on known error when strict is false', async () => {
  mockReadContract.mockImplementation(async () => {
    throw new ContractFunctionRevertedError({
      abi: universalResolverResolveSnippet,
      functionName: 'resolve',
      data: encodeErrorResult({
        abi: universalResolverResolveSnippet,
        errorName: 'ResolverNotFound',
        args: [namehash('test.eth')],
      }),
    })
  })
  const result = await resolveNameData(mockClient, {
    name: 'test.eth',
    data: '0x',
    strict: false,
  })
  expect(result).toBeNull()
})

it('throws on known error when strict is true', async () => {
  const error = new ContractFunctionRevertedError({
    abi: universalResolverResolveSnippet,
    functionName: 'resolve',
    data: encodeErrorResult({
      abi: universalResolverResolveSnippet,
      errorName: 'ResolverNotFound',
      args: [namehash('test.eth')],
    }),
  })
  mockReadContract.mockImplementation(async () => {
    throw error
  })
  await expect(
    resolveNameData(mockClient, {
      name: 'test.eth',
      data: '0x',
      strict: true,
    }),
  ).rejects.toThrowError(error)
})

it('works with multicall', async () => {
  const results = [
    encodeFunctionResult({
      abi: publicResolverTextSnippet,
      functionName: 'text',
      result: 'example@example.com',
    }),
    encodeFunctionResult({
      abi: publicResolverSingleAddrSnippet,
      functionName: 'addr',
      result: zeroAddress,
    }),
  ]
  mockReadContract.mockImplementation(
    async ({ functionName, args, address }) => {
      if (functionName === 'resolve' && Array.isArray(args)) {
        const data = encodeFunctionResult({
          abi: multicallSnippet,
          functionName: 'multicall',
          result: results,
        })

        return [data, address]
      }
      return undefined
    },
  )

  const calls = [
    encodeFunctionData(getTextParameters({ name: 'test.eth', key: 'email' })),
    encodeFunctionData(getAddressParameters({ name: 'test.eth', coin: 'ETH' })),
  ]

  const data = await resolveNameData(mockClient, {
    name: 'test.eth',
    strict: true,
    data: calls,
  })

  expect(data?.resolverAddress?.toLowerCase()).toEqual(
    '0xcffd2ae680cd110d28739a70922636b5937b022b',
  )

  expect(data?.resolvedData).toEqual(
    results.map((r) => ({ success: true, returnData: r })),
  )
})

it('throws on unknown error when strict is false', async () => {
  const error = new BaseError('Unknown error')
  mockReadContract.mockImplementation(async () => {
    throw error
  })
  await expect(
    resolveNameData(mockClient, {
      name: 'test.eth',
      data: '0x',
      strict: false,
    }),
  ).rejects.toThrowError(error)
})

it('throws on unknown error when strict is true', async () => {
  const error = new BaseError('Unknown error')
  mockReadContract.mockImplementation(async () => {
    throw error
  })
  await expect(
    resolveNameData(mockClient, {
      name: 'test.eth',
      data: '0x',
      strict: false,
    }),
  ).rejects.toThrowError(error)
})
