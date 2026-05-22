import { standardRentPriceOracleApplyDiscountSnippet } from '@ensdomains/ensjs-abi/v2/standardRentPriceOracle'
import type { Address, Client, PublicClient, Transport } from 'viem'
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest'
import { applyDiscount } from './applyDiscount.js'

const mockReadContract = vi.fn() as MockedFunction<PublicClient['readContract']>
const mockClient = {
  readContract: mockReadContract,
} as unknown as Client<Transport>

const oracleAddress: Address = '0xf33d548997e2975c8ff04f66219564d8c7a95e26'

beforeEach(() => {
  vi.resetAllMocks()
})

describe('applyDiscount', () => {
  it('calls applyDiscount on the oracle with value + duration', async () => {
    mockReadContract.mockResolvedValue(8_750n as never)

    const result = await applyDiscount(mockClient, {
      oracleAddress,
      value: 10_000n,
      duration: 78_894_000n,
    })

    expect(mockReadContract).toHaveBeenCalledTimes(1)
    expect(mockReadContract).toHaveBeenCalledWith({
      address: oracleAddress,
      abi: standardRentPriceOracleApplyDiscountSnippet,
      functionName: 'applyDiscount',
      args: [10_000n, 78_894_000n],
    })
    expect(result).toBe(8_750n)
  })

  it('coerces a number duration to bigint', async () => {
    mockReadContract.mockResolvedValue(0n as never)

    await applyDiscount(mockClient, {
      oracleAddress,
      value: 1n,
      duration: 86_400,
    })

    expect(mockReadContract).toHaveBeenCalledWith(
      expect.objectContaining({ args: [1n, 86_400n] }),
    )
  })

  it('returns the value unchanged when no discount tier applies', async () => {
    mockReadContract.mockResolvedValue(10_000n as never)

    const result = await applyDiscount(mockClient, {
      oracleAddress,
      value: 10_000n,
      duration: 1n,
    })

    expect(result).toBe(10_000n)
  })
})
