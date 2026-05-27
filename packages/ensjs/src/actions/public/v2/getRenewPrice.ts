import { ethRegistrarGetRenewPriceSnippet } from '@ensdomains/ensjs-abi/v2/ethRegistrar'
import type { Address, Client, ReadContractErrorType } from 'viem'
import { readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'

export type GetRenewPriceParameters = {
  /**
   * Address of the renewer contract. Either the v2 `ETHRegistrar` (for names registered
   * on v2) or the `ETHRenewerV1` (for names migrated from v1). Both expose the same
   * `IETHRenewer` interface.
   */
  renewerAddress: Address
  /** Label to price renewal for. Must be a bare label (e.g. `"foo"`), not a name (`"foo.eth"`). */
  label: string
  /** Renewal duration in seconds */
  duration: bigint
  /** ERC-20 payment token address */
  paymentToken: Address
}

export type GetRenewPriceReturnType = {
  /** Renewal price */
  amount: bigint
}

export type GetRenewPriceErrorType = ReadContractErrorType | TypeError

/**
 * Gets the renewal price of a label for a given duration.
 *
 * Internally calls `getRenewPrice(label, duration, paymentToken)` on a contract implementing
 * `IETHRenewer` — either `ETHRegistrar` or `ETHRenewerV1`. The renewer fetches the current
 * `expiry` and forwards it to the rent price oracle; the returned amount is the total
 * cost (no separate premium for renewals).
 *
 * @param client - {@link Client}
 * @param parameters - {@link GetRenewPriceParameters}
 * @returns Renewal price in `paymentToken` units. {@link GetRenewPriceReturnType}
 *
 * @example
 * import { getRenewPrice } from '@ensdomains/ensjs/public/v2'
 *
 * const price = await getRenewPrice(client, {
 *   renewerAddress: '0x...',
 *   label: 'example',
 *   duration: 31536000n,
 *   paymentToken: usdcAddress,
 * })
 */
export async function getRenewPrice(
  client: Client,
  { renewerAddress, label, duration, paymentToken }: GetRenewPriceParameters,
): Promise<GetRenewPriceReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const amount = await getAction(
    client,
    readContract,
    'readContract',
  )({
    address: renewerAddress,
    abi: ethRegistrarGetRenewPriceSnippet,
    functionName: 'getRenewPrice',
    args: [label, duration, paymentToken],
  })

  return { amount }
}
