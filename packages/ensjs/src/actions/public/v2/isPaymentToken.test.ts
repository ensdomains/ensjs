import { standardRentPriceOracleIsPaymentTokenSnippet } from '@ensdomains/ensjs-abi/v2/standardRentPriceOracle'
import type { Address, Client, PublicClient, Transport } from 'viem'
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest'
import { isPaymentToken } from './isPaymentToken.js'

const mockReadContract = vi.fn() as MockedFunction<PublicClient['readContract']>
const mockClient = {
  readContract: mockReadContract,
} as unknown as Client<Transport>

const oracleAddress: Address = '0xf33d548997e2975c8ff04f66219564d8c7a95e26'
const paymentToken: Address = '0x6fdfd2a902ae83a1617abc47eec6d9d2cbe7d38e'

beforeEach(() => {
  vi.resetAllMocks()
})

describe('isPaymentToken', () => {
  it('calls isPaymentToken on the oracle with the token address', async () => {
    mockReadContract.mockResolvedValue(true as never)

    const result = await isPaymentToken(mockClient, {
      oracleAddress,
      paymentToken,
    })

    expect(mockReadContract).toHaveBeenCalledTimes(1)
    expect(mockReadContract).toHaveBeenCalledWith({
      address: oracleAddress,
      abi: standardRentPriceOracleIsPaymentTokenSnippet,
      functionName: 'isPaymentToken',
      args: [paymentToken],
    })
    expect(result).toBe(true)
  })

  it('returns false for an unsupported token', async () => {
    mockReadContract.mockResolvedValue(false as never)

    const result = await isPaymentToken(mockClient, {
      oracleAddress,
      paymentToken: '0x0000000000000000000000000000000000000001',
    })

    expect(result).toBe(false)
  })
})
