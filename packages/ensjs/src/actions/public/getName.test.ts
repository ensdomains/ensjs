import {
  BaseError,
  ContractFunctionRevertedError,
  encodeErrorResult,
  type Address,
  type Client,
  type Hex,
  type PublicClient,
  type Transport,
} from 'viem'
import { mainnet } from 'viem/chains'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockedFunction,
} from 'vitest'
import { addEnsContracts } from '../../contracts/addEnsContracts.js'
import type { ChainWithContract } from '../../contracts/consts.js'
import { universalResolverReverseSnippet } from '../../contracts/universalResolver.js'
import {
  deploymentAddresses,
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../test/addTestContracts.js'
import createSubname from '../wallet/createSubname.js'
import setAddressRecord from '../wallet/setAddressRecord.js'
import setPrimaryName from '../wallet/setPrimaryName.js'
import { getName } from './getName.js'

let snapshot: Hex
let accounts: Address[]

const mockReadContract = vi.fn() as MockedFunction<PublicClient['readContract']>
const mockClient = {
  readContract: mockReadContract,
  chain: addEnsContracts(mainnet),
} as unknown as Client<Transport, ChainWithContract<'ensUniversalResolver'>>

beforeAll(async () => {
  accounts = await walletClient.getAddresses()
})

beforeEach(async () => {
  snapshot = await testClient.snapshot()
  vi.resetAllMocks()
})

afterEach(async () => {
  await testClient.revert({ id: snapshot })
})

describe('getName', () => {
  it('should get a primary name from an address', async () => {
    const result = await getName(publicClient, {
      address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "match": true,
        "name": "with-profile.eth",
        "normalised": true,
        "resolverAddress": "${deploymentAddresses.LegacyPublicResolver}",
        "reverseResolverAddress": "${deploymentAddresses.PublicResolver}",
      }
    `)
  })
  it('should return null for an address with no primary name', async () => {
    const result = await getName(publicClient, {
      address: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0',
    })
    expect(result).toBeNull()
  })
  it('should return null for a name with no forward resolution when allowMismatch is false', async () => {
    const tx = await setPrimaryName(walletClient, {
      name: 'with-profile.eth',
      account: accounts[0],
    })
    await waitForTransaction(tx)

    const result = await getName(publicClient, {
      address: accounts[0],
    })
    expect(result).toBeNull()
  })
  it('should return with a false match for a name with no forward resolution when allowMismatch is true', async () => {
    const tx = await setPrimaryName(walletClient, {
      name: 'with-profile.eth',
      account: accounts[0],
    })
    await waitForTransaction(tx)

    const result = await getName(publicClient, {
      address: accounts[0],
      allowMismatch: true,
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "match": false,
        "name": "with-profile.eth",
        "normalised": true,
        "resolverAddress": "${deploymentAddresses.LegacyPublicResolver}",
        "reverseResolverAddress": "${deploymentAddresses.PublicResolver}",
      }
    `)
  })
  it('should return null on known error when strict is false', async () => {
    mockReadContract.mockImplementation(async () => {
      throw new ContractFunctionRevertedError({
        abi: universalResolverReverseSnippet,
        functionName: 'reverse',
        data: encodeErrorResult({
          abi: universalResolverReverseSnippet,
          errorName: 'ResolverNotFound',
          args: [],
        }),
      })
    })
    const result = await getName(mockClient, {
      address: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0',
    })
    expect(result).toBeNull()
  })
  it('should throw on error when strict is true', async () => {
    const error = new ContractFunctionRevertedError({
      abi: universalResolverReverseSnippet,
      functionName: 'reverse',
      data: encodeErrorResult({
        abi: universalResolverReverseSnippet,
        errorName: 'ResolverNotFound',
        args: [],
      }),
    })
    mockReadContract.mockImplementation(async () => {
      throw error
    })
    await expect(
      getName(mockClient, {
        address: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0',
        strict: true,
      }),
    ).rejects.toThrowError(error)
  })
  it('should throw on unknown error when strict is false', async () => {
    const error = new BaseError('Unknown error')
    mockReadContract.mockImplementation(async () => {
      throw error
    })
    await expect(
      getName(mockClient, {
        address: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0',
        strict: false,
      }),
    ).rejects.toThrowError(error)
  })
  it('should throw on unknown error when strict is true', async () => {
    const error = new BaseError('Unknown error')
    mockReadContract.mockImplementation(async () => {
      throw error
    })
    await expect(
      getName(mockClient, {
        address: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0',
        strict: true,
      }),
    ).rejects.toThrowError(error)
  })
  it('returns null for a name that is not normalised', async () => {
    const tx1 = await createSubname(walletClient, {
      name: 'suB.with-profile.eth',
      contract: 'registry',
      owner: accounts[0],
      resolverAddress: deploymentAddresses.PublicResolver,
      account: accounts[2],
    })
    await waitForTransaction(tx1)
    const tx2 = await setAddressRecord(walletClient, {
      name: 'suB.with-profile.eth',
      coin: 'eth',
      resolverAddress: deploymentAddresses.PublicResolver,
      value: accounts[0],
      account: accounts[0],
    })
    await waitForTransaction(tx2)
    const tx3 = await setPrimaryName(walletClient, {
      name: 'suB.with-profile.eth',
      account: accounts[0],
    })
    await waitForTransaction(tx3)

    const result = await getName(publicClient, {
      address: accounts[0],
    })

    expect(result).toBeNull()
  })
  it('returns unnormalised name when allowUnnormalised is true', async () => {
    const tx1 = await createSubname(walletClient, {
      name: 'suB.with-profile.eth',
      contract: 'registry',
      owner: accounts[0],
      resolverAddress: deploymentAddresses.PublicResolver,
      account: accounts[2],
    })
    await waitForTransaction(tx1)
    const tx2 = await setAddressRecord(walletClient, {
      name: 'suB.with-profile.eth',
      coin: 'eth',
      resolverAddress: deploymentAddresses.PublicResolver,
      value: accounts[0],
      account: accounts[0],
    })
    await waitForTransaction(tx2)
    const tx3 = await setPrimaryName(walletClient, {
      name: 'suB.with-profile.eth',
      account: accounts[0],
    })
    await waitForTransaction(tx3)

    const result = await getName(publicClient, {
      address: accounts[0],
      allowUnnormalised: true,
    })

    expect(result).toMatchInlineSnapshot(`
      {
        "match": true,
        "name": "suB.with-profile.eth",
        "normalised": false,
        "resolverAddress": "${deploymentAddresses.PublicResolver}",
        "reverseResolverAddress": "${deploymentAddresses.PublicResolver}",
      }
    `)
  })
})
