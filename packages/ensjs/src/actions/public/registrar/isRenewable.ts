import { ethRegistrarIsRenewableSnippet } from '@ensdomains/ensjs-abi/v2/ethRegistrar'
import type { Address, Client, ReadContractErrorType } from 'viem'
import { readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'

export type IsRenewableParameters = {
  /**
   * Address of the renewer contract. Either the v2 `ETHRegistrar` (for names
   * registered on v2) or the `ETHRenewerV1` (for unmigrated v1 names). Both
   * expose the same `IETHRenewer` interface.
   */
  renewerAddress: Address
  /** Label to check (bare label, e.g. `"foo"`, not `"foo.eth"`). */
  label: string
}

export type IsRenewableReturnType = boolean

export type IsRenewableErrorType = ReadContractErrorType | TypeError

/**
 * Whether the renewer will renew a label right now, via its on-chain
 * `isRenewable(label)`.
 *
 * Useful for the `ETHRenewerV1`, which only renews RESERVED (pre-migration) or
 * in-grace names — an active, not-yet-migrated v1 name returns `false` (and
 * `getRenewPrice`/`renew` would revert `NameNotRenewable`). For the v2
 * `ETHRegistrar` it reflects the name's registered/grace status.
 *
 * @param client - {@link Client}
 * @param parameters - {@link IsRenewableParameters}
 * @returns `true` if the label is currently renewable. {@link IsRenewableReturnType}
 *
 * @example
 * import { isRenewable } from '@ensdomains/ensjs/public'
 *
 * const renewable = await isRenewable(client, {
 *   renewerAddress: '0x...',
 *   label: 'example',
 * })
 */
export async function isRenewable(
  client: Client,
  { renewerAddress, label }: IsRenewableParameters,
): Promise<IsRenewableReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  return getAction(
    client,
    readContract,
    'readContract',
  )({
    address: renewerAddress,
    abi: ethRegistrarIsRenewableSnippet,
    functionName: 'isRenewable',
    args: [label],
  })
}
