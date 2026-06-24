import { defaultReverseResolverResolveNamesSnippet } from '@ensdomains/ensjs-abi/defaultReverseResolver'
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
} from '../../clients/shared.js'
import type { ErrorType } from '../../errors/utils.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'

export type GetNamesParameters = {
  /** Addresses to get primary names for */
  addresses: readonly Address[]
}

export type GetNamesReturnType = (string | null)[]

export type GetNamesErrorType =
  | ReadContractErrorType
  | GetChainContractAddressErrorType
  | ErrorType

/**
 * Gets the ENSIP-19 default (chain-agnostic) primary names for a batch of
 * addresses by reading the `DefaultReverseResolver`'s `resolveNames`.
 *
 * This is the ENSIP-19 `default.reverse` resolver from `ens-contracts` (not a
 * v2-specific contract — ENSv2 has no reverse resolver of its own). It is read
 * directly because the Universal Resolver `reverse()` path — used by
 * {@link getName} — only resolves `addr.reverse` and does not return these
 * default reverse records.
 *
 * Note: results are NOT forward-verified. Callers that need a verified primary
 * name should check forward resolution themselves.
 *
 * @param client - {@link Client}
 * @param parameters - {@link GetNamesParameters}
 * @returns Names aligned to `addresses` (`null` where no name is set). {@link GetNamesReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getNames } from '@ensdomains/ensjs/public'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getNames(client, {
 *   addresses: ['0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5'],
 * })
 * // ['nick.eth']
 */
export async function getNames<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensDefaultReverseResolver'>,
  { addresses }: GetNamesParameters,
): Promise<GetNamesReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  if (addresses.length === 0) return []

  const resolverAddress = getChainContractAddress({
    chain: client.chain,
    contract: 'ensDefaultReverseResolver',
  })
  const readContractAction = getAction(client, readContract, 'readContract')

  const names = await readContractAction({
    address: resolverAddress,
    abi: defaultReverseResolverResolveNamesSnippet,
    functionName: 'resolveNames',
    args: [addresses],
  })

  return names.map((name) => (name === '' ? null : name))
}
