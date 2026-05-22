import { standardRentPriceOracleGetBaseRatesSnippet } from '@ensdomains/ensjs-abi/v2/standardRentPriceOracle'
import type { Address, Client, PublicClient, Transport } from 'viem'
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest'
import { getBaseRates } from './getBaseRates.js'

const mockReadContract = vi.fn() as MockedFunction<PublicClient['readContract']>
const mockClient = {
  readContract: mockReadContract,
} as unknown as Client<Transport>

const oracleAddress: Address = '0xf33d548997e2975c8ff04f66219564d8c7a95e26'

beforeEach(() => {
  vi.resetAllMocks()
})

describe('getBaseRates', () => {
  it('calls getBaseRates on the oracle and returns the rate table', async () => {
    const rates = [640_000_000n, 160_000_000n, 5_000_000n] as const
    mockReadContract.mockResolvedValue(rates as never)

    const result = await getBaseRates(mockClient, { oracleAddress })

    expect(mockReadContract).toHaveBeenCalledTimes(1)
    expect(mockReadContract).toHaveBeenCalledWith({
      address: oracleAddress,
      abi: standardRentPriceOracleGetBaseRatesSnippet,
      functionName: 'getBaseRates',
    })
    expect(result).toEqual(rates)
  })

  it('passes no args', async () => {
    mockReadContract.mockResolvedValue([] as never)

    await getBaseRates(mockClient, { oracleAddress })

    const call = mockReadContract.mock.calls[0][0] as { args?: unknown }
    expect(call.args).toBeUndefined()
  })

  it('returns an empty table when the oracle has no rates', async () => {
    mockReadContract.mockResolvedValue([] as never)

    const result = await getBaseRates(mockClient, { oracleAddress })

    expect(result).toEqual([])
  })
})
