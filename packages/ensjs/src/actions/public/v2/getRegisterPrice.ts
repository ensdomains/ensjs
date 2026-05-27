import { ethRegistrarGetRegisterPriceSnippet } from '@ensdomains/ensjs-abi/v2/ethRegistrar'
import type {
  Address,
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

export type GetRegisterPriceParameters = {
  /** Label to get price for. Must be a bare label (e.g. `"foo"`), not a name (`"foo.eth"`). */
  label: string
  /** Duration in seconds to get price for */
  duration: bigint
  /** Payment token address */
  paymentToken: Address
}

export type GetRegisterPriceReturnType = {
  /** Price base value */
  base: bigint
  /** Price premium */
  premium: bigint
}

export type GetRegisterPriceErrorType =
  | ReadContractErrorType
  | GetChainContractAddressErrorType
  | TypeError

/**
 * Gets the registration price of a label for a given duration.
 *
 * Internally calls `ETHRegistrar.getRegisterPrice(label, duration, paymentToken)`. The
 * registrar derives the `available` period (time elapsed since `expiry + GRACE_PERIOD`)
 * from on-chain state and passes it to the rent price oracle; this means the returned
 * `premium` already reflects the post-expiry exponential-decay premium curve.
 *
 * @param client - {@link Client}
 * @param parameters - {@link GetRegisterPriceParameters}
 * @returns Price data object. {@link GetRegisterPriceReturnType}
 */
export async function getRegisterPrice<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensEthRegistrar'>,
  { label, duration, paymentToken }: GetRegisterPriceParameters,
): Promise<GetRegisterPriceReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const [base, premium] = await getAction(
    client,
    readContract,
    'readContract',
  )({
    address: getChainContractAddress({
      chain: client.chain,
      contract: 'ensEthRegistrar',
    }),
    abi: ethRegistrarGetRegisterPriceSnippet,
    functionName: 'getRegisterPrice',
    args: [label, duration, paymentToken],
  })

  return { base, premium }
}
