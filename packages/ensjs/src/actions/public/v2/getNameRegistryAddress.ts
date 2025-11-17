import type { Client } from 'viem'
import type { Address } from 'viem/accounts'
import { type ReadContractErrorType, readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { registryGetSubregistrySnippet } from '../../../contracts/ethRegistry.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'

export type GetNameRegistryAddressParameters = {
  /**
   * The parent registry address that manages this label.
   * Example: the .eth registry address when querying `flo` for `flo.eth`.
   */
  registryAddress: Address

  /**
   * The label whose registry we want to look up.
   * Example: "flo" for "flo.eth".
   */
  label: string
}

export type GetNameRegistryAddressReturnType = Address

export type GetNameRegistryAddressErrorType = ReadContractErrorType

/**
 * Gets the subregistry (registry for a label) from a parent registry.
 *
 * This calls `getSubregistry(label)` on the given `registryAddress`.
 * If no registry is set for the label, this typically returns the zero address.
 *
 * @param client - {@link Client}
 * @param parameters - {@link GetNameRegistryAddressParameters}
 * @returns Address of the subregistry, or the zero address if none is set. {@link GetNameRegistryAddressReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getNameRegistryAddress } from '@ensdomains/ensjs/public/v2'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 *
 * // Example for label "flo" under the .eth registry
 * const registryAddress = '0xEthRegistryAddress' as const
 * const result = await getNameRegistryAddress(client, {
 *   registryAddress,
 *   label: 'flo',
 * })
 * // result: Address of flo.eth's registry, or 0x000... if none set.
 */
export async function getNameRegistryAddress(
  client: Client,
  { registryAddress, label }: GetNameRegistryAddressParameters,
): Promise<GetNameRegistryAddressReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')

  return readContractAction({
    address: registryAddress,
    abi: registryGetSubregistrySnippet,
    functionName: 'getSubregistry',
    args: [label],
  })
}
