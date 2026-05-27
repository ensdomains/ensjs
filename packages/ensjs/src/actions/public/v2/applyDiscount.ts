import { standardRentPriceOracleApplyDiscountSnippet } from '@ensdomains/ensjs-abi/v2/standardRentPriceOracle'
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

export type ApplyDiscountParameters = {
  /** Undiscounted value (e.g. baseRate × duration), in standard units */
  value: bigint
  /** Term length in seconds — selects the discount tier */
  duration: bigint | number
}

export type ApplyDiscountReturnType = bigint

export type ApplyDiscountErrorType =
  | ReadContractErrorType
  | GetChainContractAddressErrorType

/**
 * Applies the oracle's duration-tiered discount to an arbitrary value. The
 * oracle uses a step-function keyed on duration; doing this on-chain keeps the
 * caller agnostic to the contract's discount denominator.
 *
 * @param client - {@link Client}
 * @param parameters - {@link ApplyDiscountParameters}
 * @returns The discounted value. {@link ApplyDiscountReturnType}
 */
export async function applyDiscount<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensStandardRentPriceOracle'>,
  { value, duration }: ApplyDiscountParameters,
): Promise<ApplyDiscountReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')

  return readContractAction({
    address: getChainContractAddress({
      chain: client.chain,
      contract: 'ensStandardRentPriceOracle',
    }),
    abi: standardRentPriceOracleApplyDiscountSnippet,
    functionName: 'applyDiscount',
    args: [value, BigInt(duration)],
  })
}
