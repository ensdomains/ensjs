import { standardRentPriceOracleGetBaseRatesSnippet } from '@ensdomains/ensjs-abi/v2/standardRentPriceOracle'
import type { Address, Client, ReadContractErrorType } from 'viem'
import { readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'

export type GetBaseRatesParameters = {
  /** Address of the StandardRentPriceOracle contract */
  oracleAddress: Address
}

export type GetBaseRatesReturnType = readonly bigint[]

export type GetBaseRatesErrorType = ReadContractErrorType

/**
 * Gets the per-codepoint base rate table from the StandardRentPriceOracle. The
 * array is indexed by `label length - 1` (clamped to the last entry for longer
 * labels), each value being the base rate per second in standard units.
 *
 * @param client - {@link Client}
 * @param parameters - {@link GetBaseRatesParameters}
 * @returns The base rate table. {@link GetBaseRatesReturnType}
 */
export async function getBaseRates(
  client: Client,
  { oracleAddress }: GetBaseRatesParameters,
): Promise<GetBaseRatesReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')

  return readContractAction({
    address: oracleAddress,
    abi: standardRentPriceOracleGetBaseRatesSnippet,
    functionName: 'getBaseRates',
  })
}
