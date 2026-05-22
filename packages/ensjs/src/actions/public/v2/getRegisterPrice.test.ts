import { ethRegistrarGetRegisterPriceSnippet } from '@ensdomains/ensjs-abi/v2/ethRegistrar'
import type { Address, Client, PublicClient, Transport } from 'viem'
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest'
import { getRegisterPrice } from './getRegisterPrice.js'

const mockReadContract = vi.fn() as MockedFunction<PublicClient['readContract']>
const mockClient = {
  readContract: mockReadContract,
} as unknown as Client<Transport>

const registrarAddress: Address = '0xb68e594a47fe057bd31e7a8229ffcfd85b2e28af'
const paymentToken: Address = '0x6fdfd2a902ae83a1617abc47eec6d9d2cbe7d38e'

beforeEach(() => {
  vi.resetAllMocks()
})

describe('getRegisterPrice', () => {
  it('calls getRegisterPrice on the registrar with the label, duration and token', async () => {
    mockReadContract.mockResolvedValue([100n, 25n] as never)

    const result = await getRegisterPrice(mockClient, {
      registrarAddress,
      name: 'example.eth',
      duration: 31_536_000n,
      paymentToken,
    })

    expect(mockReadContract).toHaveBeenCalledTimes(1)
    expect(mockReadContract).toHaveBeenCalledWith({
      address: registrarAddress,
      abi: ethRegistrarGetRegisterPriceSnippet,
      functionName: 'getRegisterPrice',
      args: ['example', 31_536_000n, paymentToken],
    })
    expect(result).toEqual({ base: 100n, premium: 25n })
  })

  it('coerces a number duration to bigint', async () => {
    mockReadContract.mockResolvedValue([1n, 0n] as never)

    await getRegisterPrice(mockClient, {
      registrarAddress,
      name: 'example.eth',
      duration: 86_400,
      paymentToken,
    })

    expect(mockReadContract).toHaveBeenCalledWith(
      expect.objectContaining({ args: ['example', 86_400n, paymentToken] }),
    )
  })

  it('surfaces a non-zero premium', async () => {
    mockReadContract.mockResolvedValue([500n, 750n] as never)

    const result = await getRegisterPrice(mockClient, {
      registrarAddress,
      name: 'premium.eth',
      duration: 1n,
      paymentToken,
    })

    expect(result).toEqual({ base: 500n, premium: 750n })
  })

  it.each(['sub.example.eth', 'example.com', 'eth'])(
    'throws UnsupportedNameTypeError for non-eth-2ld name "%s" without calling the contract',
    async (name) => {
      await expect(
        getRegisterPrice(mockClient, {
          registrarAddress,
          name,
          duration: 1n,
          paymentToken,
        }),
      ).rejects.toThrowError(/eth-2ld/)
      expect(mockReadContract).not.toHaveBeenCalled()
    },
  )

  it('propagates contract reverts (e.g. NameNotAvailable)', async () => {
    mockReadContract.mockRejectedValue(new Error('execution reverted') as never)

    await expect(
      getRegisterPrice(mockClient, {
        registrarAddress,
        name: 'taken.eth',
        duration: 1n,
        paymentToken,
      }),
    ).rejects.toThrow('execution reverted')
  })
})
