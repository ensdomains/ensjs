import { standardRentPriceOracleGetBaseRatesSnippet } from '@ensdomains/ensjs-abi/v2/standardRentPriceOracle'
import type {
  Chain,
  GetChainContractAddressErrorType,
  ReadContractErrorType,
} from 'viem'
import { readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import {
  getChainContractAddress,
  type RequireClientContracts,
} from '../../../clients/shared.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'

export type GetBaseRatesReturnType = readonly bigint[]

export type GetBaseRatesErrorType =
  | ReadContractErrorType
  | GetChainContractAddressErrorType

/**
 * Gets the per-codepoint base rate table from the StandardRentPriceOracle. The
 * array is indexed by `label length - 1` (clamped to the last entry for longer
 * labels), each value being the base rate per second in standard units.
 *
 * @param client - {@link Client}
 * @returns The base rate table. {@link GetBaseRatesReturnType}
 */
export async function getBaseRates<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensStandardRentPriceOracle'>,
): Promise<GetBaseRatesReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')

  return readContractAction({
    address: getChainContractAddress({
      chain: client.chain,
      contract: 'ensStandardRentPriceOracle',
    }),
    abi: standardRentPriceOracleGetBaseRatesSnippet,
    functionName: 'getBaseRates',
  })
}
