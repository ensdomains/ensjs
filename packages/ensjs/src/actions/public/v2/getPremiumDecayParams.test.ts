import { standardRentPriceOraclePremiumParamsSnippet } from '@ensdomains/ensjs-abi/v2/standardRentPriceOracle'
import type { Address, Client, PublicClient, Transport } from 'viem'
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest'
import { getPremiumDecayParams } from './getPremiumDecayParams.js'

const mockMulticall = vi.fn() as MockedFunction<PublicClient['multicall']>
const mockClient = {
  multicall: mockMulticall,
} as unknown as Client<Transport>

const oracleAddress: Address = '0xf33d548997e2975c8ff04f66219564d8c7a95e26'

beforeEach(() => {
  vi.resetAllMocks()
})

describe('getPremiumDecayParams', () => {
  it('multicalls the three immutable premium getters and maps the result', async () => {
    mockMulticall.mockResolvedValue([
      100_000_000n,
      86_400n,
      2_419_200n,
    ] as never)

    const result = await getPremiumDecayParams(mockClient, { oracleAddress })

    expect(mockMulticall).toHaveBeenCalledTimes(1)
    expect(mockMulticall).toHaveBeenCalledWith({
      allowFailure: false,
      contracts: [
        {
          address: oracleAddress,
          abi: standardRentPriceOraclePremiumParamsSnippet,
          functionName: 'PREMIUM_PRICE_INITIAL',
        },
        {
          address: oracleAddress,
          abi: standardRentPriceOraclePremiumParamsSnippet,
          functionName: 'PREMIUM_HALVING_PERIOD',
        },
        {
          address: oracleAddress,
          abi: standardRentPriceOraclePremiumParamsSnippet,
          functionName: 'PREMIUM_PERIOD',
        },
      ],
    })
    expect(result).toEqual({
      priceInitial: 100_000_000n,
      halvingPeriod: 86_400n,
      period: 2_419_200n,
    })
  })

  it('returns bigints for the period fields', async () => {
    mockMulticall.mockResolvedValue([0n, 60n, 120n] as never)

    const result = await getPremiumDecayParams(mockClient, { oracleAddress })

    expect(typeof result.priceInitial).toBe('bigint')
    expect(typeof result.halvingPeriod).toBe('bigint')
    expect(typeof result.period).toBe('bigint')
  })
})
