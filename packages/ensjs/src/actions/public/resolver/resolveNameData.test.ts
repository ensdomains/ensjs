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
  type Address,
  BaseError,
  type Client,
  ContractFunctionRevertedError,
  createClient,
  custom,
  encodeAbiParameters,
  encodeErrorResult,
  encodeFunctionData,
  encodeFunctionResult,
  type Hex,
  isAddressEqual,
  namehash,
  type PublicClient,
  type Transport,
  toFunctionSelector,
  toHex,
  zeroAddress,
} from 'viem'
import { mainnet } from 'viem/chains'
import { packetToBytes } from 'viem/ens'
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest'
import {
  type ChainWithContracts,
  getChainContractAddress,
} from '../../../clients/chain.js'
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

describe('a CCIP-Read name', () => {
  const MIRROR = '0x394D8EB4a4fDF599384DeAb25F31d111d755c398'
  const RESOLVER = '0xde9049636F4a1dfE0a64d1bFe3155C0A14C54F31'
  const name = 'jesse.base.eth'
  const calls = [
    encodeFunctionData(getTextParameters({ name, key: 'description' })),
    encodeFunctionData(getAddressParameters({ name, coin: 'ETH' })),
  ]
  const results = [
    encodeFunctionResult({
      abi: publicResolverTextSnippet,
      functionName: 'text',
      result: 'gm',
    }),
    encodeFunctionResult({
      abi: publicResolverSingleAddrSnippet,
      functionName: 'addr',
      result: '0x2211d1D0020DAEA8039E46Cf1367962070d77DA9',
    }),
  ]
  const multicallResult = encodeFunctionResult({
    abi: multicallSnippet,
    functionName: 'multicall',
    result: results,
  })
  const offchainLookup = `${'0x556f1830'}${'0'.repeat(64)}` as Hex
  const revert = (data: Hex) =>
    Object.assign(new Error('execution reverted'), { code: 3, data })
  const universalResolver = getChainContractAddress({
    chain: addEnsContracts(mainnet),
    contract: 'ensUniversalResolver',
  })
  const supported = (answer: boolean) =>
    encodeAbiParameters([{ type: 'bool' }], [answer])

  /** A chain where the universal resolver needs CCIP-Read for `name`. */
  const clientWith = ({
    batchesAlready = false,
    batch = async () =>
      encodeAbiParameters([{ type: 'bytes' }], [multicallResult]),
  }: {
    batchesAlready?: boolean
    batch?: () => Promise<Hex>
  } = {}) => {
    const universalResolverCalls: Hex[] = []
    const resolverCalls: Hex[] = []
    const request = async ({
      method,
      params,
    }: {
      method: string
      params: unknown
    }) => {
      if (method !== 'eth_call') throw new Error(`unexpected ${method}`)
      const [{ to, data }] = params as [{ to: Address; data: Hex }]
      const selector = data.slice(0, 10)
      if (isAddressEqual(to, universalResolver)) {
        if (selector === toFunctionSelector('findResolver(bytes)'))
          return encodeAbiParameters(
            [{ type: 'address' }, { type: 'bytes32' }, { type: 'uint256' }],
            [MIRROR, namehash(name), 6n],
          )
        universalResolverCalls.push(data)
        // The first read goes without CCIP-Read; a fallback read follows it.
        if (universalResolverCalls.length === 1) throw revert(offchainLookup)
        return encodeAbiParameters(
          [{ type: 'bytes' }, { type: 'address' }],
          [multicallResult, MIRROR],
        )
      }
      if (selector === toFunctionSelector('supportsInterface(bytes4)')) {
        const interfaceId = `0x${data.slice(10, 18)}`
        if (isAddressEqual(to, MIRROR))
          return supported(interfaceId === '0xeea330f9')
        return supported(
          interfaceId === '0x9061b923' ||
            (batchesAlready && interfaceId === '0x582de3e7'),
        )
      }
      if (selector === toFunctionSelector('getResolver(bytes)'))
        return encodeAbiParameters(
          [{ type: 'address' }, { type: 'bool' }],
          [RESOLVER, false],
        )
      if (selector === toFunctionSelector('supportsFeature(bytes4)'))
        return supported(batchesAlready)
      if (isAddressEqual(to, RESOLVER)) {
        resolverCalls.push(data)
        return batch()
      }
      throw new Error(`unexpected call to ${to}`)
    }
    const client = createClient({
      chain: addEnsContracts(mainnet),
      transport: custom({ request }, { retryCount: 0 }),
    }) as Client<Transport, ChainWithContracts<'ensUniversalResolver'>>
    return { client, universalResolverCalls, resolverCalls }
  }
  const expected = {
    resolvedData: results.map((returnData) => ({ success: true, returnData })),
    resolverAddress: MIRROR,
  }

  it('asks the resolver behind the mirror once instead of per record', async () => {
    const { client, universalResolverCalls, resolverCalls } = clientWith()

    await expect(
      resolveNameData(client, { name, data: calls }),
    ).resolves.toEqual(expected)
    // Only the CCIP-free probe reached the universal resolver.
    expect(universalResolverCalls).toHaveLength(1)
    expect(resolverCalls).toHaveLength(1)
  })

  it.each([
    {
      label: 'advertises ERC-7996 RESOLVE_MULTICALL',
      options: { batchesAlready: true },
      resolverCallCount: 0,
    },
    {
      label: 'rejects the batch',
      options: { batch: async () => Promise.reject(revert('0x')) },
      resolverCallCount: 1,
    },
    {
      label: 'answers the batch with nothing',
      options: { batch: async () => '0x' as Hex },
      resolverCallCount: 1,
    },
  ])(
    'leaves the batch to the universal resolver when the resolver $label',
    async ({ options, resolverCallCount }) => {
      const { client, universalResolverCalls, resolverCalls } =
        clientWith(options)

      await expect(
        resolveNameData(client, { name, data: calls }),
      ).resolves.toEqual(expected)
      expect(universalResolverCalls).toHaveLength(2)
      expect(resolverCalls).toHaveLength(resolverCallCount)
    },
  )
})
