import { ethRegistrarGetRenewPriceSnippet } from '@ensdomains/ensjs-abi/v2/ethRegistrar'
import type { Address, Client, ReadContractErrorType } from 'viem'
import { readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { UnsupportedNameTypeError } from '../../../errors/general.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import { getNameType } from '../../../utils/name/getNameType.js'

export type GetRenewPriceParameters = {
  /**
   * Address of the renewer contract. Either the v2 `ETHRegistrar` (for names registered
   * on v2) or the `ETHRenewerV1` (for names migrated from v1). Both expose the same
   * `IETHRenewer` interface.
   */
  renewerAddress: Address
  /** Name, or array of names, to price renewal for */
  nameOrNames: string | string[]
  /** Renewal duration in seconds */
  duration: bigint
  /** Payment token address */
  paymentToken: Address
}

export type GetRenewPriceReturnType = {
  /** Total renewal price across all provided names */
  amount: bigint
}

export type GetRenewPriceErrorType =
  | UnsupportedNameTypeError
  | ReadContractErrorType
  | TypeError

/**
 * Gets the renewal price of a name, or array of names, for a given duration.
 *
 * Internally calls `getRenewPrice(label, duration, paymentToken)` on a contract implementing
 * `IETHRenewer` — either `ETHRegistrar` or `ETHRenewerV1`. The renewer fetches the current
 * `expiry` and forwards it to the rent price oracle; the returned amount is the total
 * cost (no separate premium for renewals).
 *
 * @param client - {@link Client}
 * @param parameters - {@link GetRenewPriceParameters}
 * @returns Renewal price object. {@link GetRenewPriceReturnType}
 */
export async function getRenewPrice(
  client: Client,
  {
    renewerAddress,
    nameOrNames,
    duration,
    paymentToken,
  }: GetRenewPriceParameters,
): Promise<GetRenewPriceReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const names = Array.isArray(nameOrNames) ? nameOrNames : [nameOrNames]

  let total = 0n

  const readContractAction = getAction(client, readContract, 'readContract')

  for (const name of names) {
    const labels = name.split('.')
    const nameType = getNameType(name)

    if (nameType !== 'eth-2ld' && nameType !== 'tld') {
      throw new UnsupportedNameTypeError({
        nameType,
        supportedNameTypes: ['eth-2ld', 'tld'],
        details:
          'Currently only the renewal price of eth-2ld names can be fetched',
      })
    }

    const amount = await readContractAction({
      address: renewerAddress,
      abi: ethRegistrarGetRenewPriceSnippet,
      functionName: 'getRenewPrice',
      args: [labels[0], duration, paymentToken],
    })

    total += amount
  }

  return { amount: total }
}
