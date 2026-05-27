import { standardRentPriceOracleConstantsSnippet } from '@ensdomains/ensjs-abi/v2/standardRentPriceOracle'
import type { Address, Client, MulticallErrorType } from 'viem'
import { multicall } from 'viem/actions'
import { getAction } from 'viem/utils'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'

export type GetPremiumDecayParamsParameters = {
  /** Address of the StandardRentPriceOracle contract */
  oracleAddress: Address
}

export type GetPremiumDecayParamsReturnType = {
  /** Starting value of the expiry-premium exponential decay, in standard units */
  priceInitial: bigint
  /** Seconds for the premium to halve */
  halvingPeriod: bigint
  /** Total premium window in seconds (premium reaches zero at this offset) */
  period: bigint
}

export type GetPremiumDecayParamsErrorType = MulticallErrorType

/**
 * Reads the StandardRentPriceOracle's immutable expiry-premium decay parameters
 * (`PREMIUM_PRICE_INITIAL`, `PREMIUM_HALVING_PERIOD`, `PREMIUM_PERIOD`) in a
 * single multicall. Useful for plotting the premium curve client-side without
 * sampling `getPremiumPriceAfter` repeatedly.
 *
 * @param client - {@link Client}
 * @param parameters - {@link GetPremiumDecayParamsParameters}
 * @returns Premium decay parameters. {@link GetPremiumDecayParamsReturnType}
 */
export async function getPremiumDecayParams(
  client: Client,
  { oracleAddress }: GetPremiumDecayParamsParameters,
): Promise<GetPremiumDecayParamsReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const multicallAction = getAction(client, multicall, 'multicall')

  const [priceInitial, halvingPeriod, period] = await multicallAction({
    allowFailure: false,
    contracts: [
      {
        address: oracleAddress,
        abi: standardRentPriceOracleConstantsSnippet,
        functionName: 'PREMIUM_PRICE_INITIAL',
      },
      {
        address: oracleAddress,
        abi: standardRentPriceOracleConstantsSnippet,
        functionName: 'PREMIUM_HALVING_PERIOD',
      },
      {
        address: oracleAddress,
        abi: standardRentPriceOracleConstantsSnippet,
        functionName: 'PREMIUM_PERIOD',
      },
    ],
  })

  return {
    priceInitial,
    halvingPeriod: BigInt(halvingPeriod),
    period: BigInt(period),
  }
}
