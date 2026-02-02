import type { Client } from 'viem'
import type { Address } from 'viem/accounts'
import { type ReadContractErrorType, readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { registryGetResolverSnippet } from '../../../contracts/ethRegistry.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'

export type GetNameResolverAddressParameters = {
  /**
   * The registry address that manages this label.
   * Example: the .eth registry address when querying `flo` for `flo.eth`.
   */
  registryAddress: Address

  /**
   * The label whose resolver we want to look up.
   * Example: "flo" for "flo.eth".
   */
  label: string
}

export type GetNameResolverAddressReturnType = Address

export type GetNameResolverAddressErrorType = ReadContractErrorType

/**
 * Gets the resolver address for a label from a v2 registry.
 *
 * This calls `getResolver(label)` on the given `registryAddress`.
 * If no resolver is set for the label, this typically returns the zero address.
 *
 * @param client - {@link Client}
 * @param parameters - {@link GetNameResolverAddressParameters}
 * @returns Address of the resolver, or the zero address if none is set. {@link GetNameResolverAddressReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getNameResolverAddress } from '@ensdomains/ensjs/public/v2'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * // Example for label "flo" under the .eth registry
 * const registryAddress = '0xEthRegistryAddress' as const
 * const result = await getNameResolverAddress(client, {
 *   registryAddress,
 *   label: 'flo',
 * })
 * // result: Address of flo.eth's resolver, or 0x000... if none set.
 */
export async function getNameResolverAddress(
  client: Client,
  { registryAddress, label }: GetNameResolverAddressParameters,
): Promise<GetNameResolverAddressReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')

  return readContractAction({
    address: registryAddress,
    abi: registryGetResolverSnippet,
    functionName: 'getResolver',
    args: [label],
  })
}
