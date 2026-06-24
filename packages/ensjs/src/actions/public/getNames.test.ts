import { defaultReverseResolverResolveNamesSnippet } from '@ensdomains/ensjs-abi/defaultReverseResolver'
import type { Client, PublicClient, Transport } from 'viem'
import { mainnet } from 'viem/chains'
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest'
import type { ChainWithContracts } from '../../clients/shared.js'
import { addEnsL1Contracts } from '../../index.js'
import { getNames } from './getNames.js'

const mockReadContract = vi.fn() as MockedFunction<PublicClient['readContract']>
const mockClient = {
  readContract: mockReadContract,
  chain: addEnsL1Contracts(mainnet),
} as unknown as Client<
  Transport,
  ChainWithContracts<'ensDefaultReverseResolver'>
>

// Arbitrary input addresses — `readContract` is mocked, so these are never
// resolved on-chain; they only need to be valid addresses passed through to the
// `resolveNames` call.
const addressA = '0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5' as const
const addressB = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' as const

beforeEach(() => {
  vi.resetAllMocks()
})

describe('getNames', () => {
  it('returns an empty array without reading the chain when given no addresses', async () => {
    const result = await getNames(mockClient, { addresses: [] })
    expect(result).toEqual([])
    expect(mockReadContract).not.toHaveBeenCalled()
  })

  it('reads `resolveNames` from the DefaultReverseResolver with the given addresses', async () => {
    mockReadContract.mockResolvedValueOnce(['nick.eth', ''])

    await getNames(mockClient, { addresses: [addressA, addressB] })

    expect(mockReadContract).toHaveBeenCalledTimes(1)
    expect(mockReadContract).toHaveBeenCalledWith(
      expect.objectContaining({
        abi: defaultReverseResolverResolveNamesSnippet,
        functionName: 'resolveNames',
        args: [[addressA, addressB]],
      }),
    )
  })

  it('returns names aligned to the input addresses', async () => {
    mockReadContract.mockResolvedValueOnce(['nick.eth', 'with-profile.eth'])

    const result = await getNames(mockClient, {
      addresses: [addressA, addressB],
    })

    expect(result).toEqual(['nick.eth', 'with-profile.eth'])
  })

  it('maps empty-string results to null', async () => {
    mockReadContract.mockResolvedValueOnce(['nick.eth', '', 'with-profile.eth'])

    const result = await getNames(mockClient, {
      addresses: [addressA, addressB, addressA],
    })

    expect(result).toEqual(['nick.eth', null, 'with-profile.eth'])
  })

  it('returns all nulls when no addresses have a primary name', async () => {
    mockReadContract.mockResolvedValueOnce(['', ''])

    const result = await getNames(mockClient, {
      addresses: [addressA, addressB],
    })

    expect(result).toEqual([null, null])
  })
})
