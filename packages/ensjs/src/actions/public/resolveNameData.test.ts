import {
  BaseError,
  type Client,
  ContractFunctionRevertedError,
  encodeErrorResult,
  encodeFunctionData,
  type Hex,
  namehash,
  type PublicClient,
  type Transport,
} from 'viem'
import { mainnet } from 'viem/chains'
import { hexToBytes } from 'viem/utils'
import { beforeEach, expect, it, type MockedFunction, vi } from 'vitest'
import { addEnsContracts } from '../../contracts/addEnsContracts.js'
import type { ChainWithContract } from '../../contracts/consts.js'
import {
  universalResolverResolveSnippet,
  universalResolverResolveWithGatewaysSnippet,
} from '../../contracts/universalResolver.js'
import { resolverMulticallParameters } from '../../utils/index.js'
import { bytesToPacket } from '../../utils/name/hexEncodedName.js'
import { resolveNameData } from './resolveNameData.js'

const mockReadContract = vi.fn() as MockedFunction<PublicClient['readContract']>
const mockClient = {
  readContract: mockReadContract,
  chain: addEnsContracts(mainnet),
} as unknown as Client<Transport, ChainWithContract<'ensUniversalResolver'>>

beforeEach(() => {
  vi.clearAllMocks()
})

it('encodes labels larger than 255 bytes', async () => {
  await resolveNameData(mockClient, {
    name: `${'a'.repeat(300)}.eth`,
    data: '0x',
  }).catch(() => {})
  const [{ args }] = mockReadContract.mock.calls[0]
  const name = bytesToPacket(hexToBytes(args![0] as Hex))
  expect(name).toMatchInlineSnapshot(
    `"[5b7e0e47a96f32a88b4f14ca177982790807c40e1a105742ba0fc1babe1ef826].eth"`,
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
  const calls = await resolverMulticallParameters({
    namehash: namehash('test.eth'),
    clearRecords: true,
    coins: [
      { coin: 'ETH', value: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' },
    ],

    texts: [{ key: 'email', value: 'test@example.com' }],
  })

  const data = await resolveNameData(mockClient, {
    name: 'test.eth',
    strict: true,
    data: calls.map((c) =>
      encodeFunctionData({
        abi: c.abi,
        functionName: c.functionName,
        args: c.args,
      }),
    ),
  })
  expect(data).toMatchInlineSnapshot()
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
