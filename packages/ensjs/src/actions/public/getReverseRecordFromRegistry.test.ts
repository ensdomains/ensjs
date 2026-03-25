import type { Client, PublicClient, Transport } from 'viem'
import { mainnet } from 'viem/chains'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest'
import type { ChainWithContracts } from '../../clients/shared.js'
import { dedicatedResolverNameSnippet } from '../../contracts/dedicatedResolver.js'
import { registryResolverSnippet } from '../../contracts/registry.js'
import { addEnsL1Contracts } from '../../index.js'
import {
  deploymentAddresses,
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../test/addTestContracts.js'
import { setPrimaryName } from '../wallet/setPrimaryName.js'
import { getReverseRecordFromRegistry } from './getReverseRecordFromRegistry.js'

let snapshot: `0x${string}`

const mockReadContract = vi.fn() as MockedFunction<PublicClient['readContract']>
const mockClient = {
  readContract: mockReadContract,
  chain: addEnsL1Contracts(mainnet),
} as unknown as Client<Transport, ChainWithContracts<'ensRegistry'>>

beforeEach(async () => {
  snapshot = await testClient.snapshot()
  vi.resetAllMocks()
})

afterEach(async () => {
  await testClient.revert({ id: snapshot })
})

describe('getReverseRecordFromRegistry', () => {
  it('returns the reverse record for an address with a primary name', async () => {
    const result = await getReverseRecordFromRegistry(publicClient, {
      address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "name": "with-profile.eth",
        "reverseResolverAddress": "${deploymentAddresses.PublicResolver}",
      }
    `)
  })

  it('returns null for an address with no reverse record', async () => {
    const result = await getReverseRecordFromRegistry(publicClient, {
      address: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0',
    })
    expect(result).toBeNull()
  })

  it('returns the reverse record after setPrimaryName', async () => {
    const [account] = await walletClient.getAddresses()
    if (!account) throw new Error('No account')

    const tx = await setPrimaryName(walletClient, {
      name: 'with-profile.eth',
      account,
    })
    await waitForTransaction(tx)

    const result = await getReverseRecordFromRegistry(publicClient, {
      address: account,
    })
    expect(result).not.toBeNull()
    expect(result?.name).toBe('with-profile.eth')
    expect(result?.reverseResolverAddress).toBe(
      deploymentAddresses.PublicResolver,
    )
  })

  it('returns null when registry has no resolver for address', async () => {
    mockReadContract.mockResolvedValueOnce(
      '0x0000000000000000000000000000000000000000',
    )

    const result = await getReverseRecordFromRegistry(mockClient, {
      address: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0',
    })
    expect(result).toBeNull()
    expect(mockReadContract).toHaveBeenCalledTimes(1)
  })

  it('returns null when resolver returns empty name', async () => {
    mockReadContract
      .mockResolvedValueOnce('0xa2c122be93b0074270ebee7f6b7292c7deb45047')
      .mockResolvedValueOnce('')

    const result = await getReverseRecordFromRegistry(mockClient, {
      address: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0',
    })
    expect(result).toBeNull()
    expect(mockReadContract).toHaveBeenCalledTimes(2)
  })

  it('returns name and reverseResolverAddress when resolver has name', async () => {
    const resolverAddress = '0xa2c122be93b0074270ebee7f6b7292c7deb45047'
    mockReadContract
      .mockResolvedValueOnce(resolverAddress)
      .mockResolvedValueOnce('nick.eth')

    const result = await getReverseRecordFromRegistry(mockClient, {
      address: '0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5',
    })
    expect(result).toEqual({
      name: 'nick.eth',
      reverseResolverAddress: resolverAddress,
    })
    expect(mockReadContract).toHaveBeenCalledTimes(2)
    expect(mockReadContract).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        abi: registryResolverSnippet,
        functionName: 'resolver',
      }),
    )
    expect(mockReadContract).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        address: resolverAddress,
        abi: dedicatedResolverNameSnippet,
        functionName: 'name',
      }),
    )
  })
})
