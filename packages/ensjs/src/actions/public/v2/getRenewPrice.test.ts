import { ethRegistrarGetRenewPriceSnippet } from '@ensdomains/ensjs-abi/v2/ethRegistrar'
import type { Address, Client, PublicClient, Transport } from 'viem'
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest'
import { getRenewPrice } from './getRenewPrice.js'

const mockReadContract = vi.fn() as MockedFunction<PublicClient['readContract']>
const mockClient = {
  readContract: mockReadContract,
} as unknown as Client<Transport>

const registrarAddress: Address = '0xb68e594a47fe057bd31e7a8229ffcfd85b2e28af'
const paymentToken: Address = '0x6fdfd2a902ae83a1617abc47eec6d9d2cbe7d38e'

beforeEach(() => {
  vi.resetAllMocks()
})

describe('getRenewPrice', () => {
  it('calls getRenewPrice on the registrar and returns the single amount', async () => {
    mockReadContract.mockResolvedValue(7_994_022n as never)

    const result = await getRenewPrice(mockClient, {
      registrarAddress,
      name: 'example.eth',
      duration: 31_536_000n,
      paymentToken,
    })

    expect(mockReadContract).toHaveBeenCalledTimes(1)
    expect(mockReadContract).toHaveBeenCalledWith({
      address: registrarAddress,
      abi: ethRegistrarGetRenewPriceSnippet,
      functionName: 'getRenewPrice',
      args: ['example', 31_536_000n, paymentToken],
    })
    expect(result).toBe(7_994_022n)
  })

  it('coerces a number duration to bigint', async () => {
    mockReadContract.mockResolvedValue(1n as never)

    await getRenewPrice(mockClient, {
      registrarAddress,
      name: 'example.eth',
      duration: 86_400,
      paymentToken,
    })

    expect(mockReadContract).toHaveBeenCalledWith(
      expect.objectContaining({ args: ['example', 86_400n, paymentToken] }),
    )
  })

  it.each(['sub.example.eth', 'example.com', 'eth'])(
    'throws UnsupportedNameTypeError for non-eth-2ld name "%s" without calling the contract',
    async (name) => {
      await expect(
        getRenewPrice(mockClient, {
          registrarAddress,
          name,
          duration: 1n,
          paymentToken,
        }),
      ).rejects.toThrowError(/eth-2ld/)
      expect(mockReadContract).not.toHaveBeenCalled()
    },
  )

  it('propagates contract reverts (e.g. NameNotRenewable)', async () => {
    mockReadContract.mockRejectedValue(new Error('execution reverted') as never)

    await expect(
      getRenewPrice(mockClient, {
        registrarAddress,
        name: 'unregistered.eth',
        duration: 1n,
        paymentToken,
      }),
    ).rejects.toThrow('execution reverted')
  })
})
