import { permissionedResolverNameSnippet } from '@ensdomains/ensjs-abi/v2/permissionedResolver'
import { registryResolverSnippet } from '@ensdomains/ensjs-abi/registry'
import {
  type Address,
  type Chain,
  type GetChainContractAddressErrorType,
  type ReadContractErrorType,
  zeroAddress,
} from 'viem'
import { readContract } from 'viem/actions'
import { namehash } from 'viem/ens'
import { getAction } from 'viem/utils'
import {
  getChainContractAddress,
  type RequireClientContracts,
} from '../../clients/shared.js'
import type { ErrorType } from '../../errors/utils.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'

export type GetReverseRecordFromRegistryParameters = {
  /** Address to get the reverse name for */
  address: Address
}

export type GetReverseRecordFromRegistryReturnType = {
  /** Primary name for address */
  name: string
  /** Resolver address for reverse node */
  reverseResolverAddress: Address
} | null

export type GetReverseRecordFromRegistryErrorType =
  | ReadContractErrorType
  | GetChainContractAddressErrorType
  | ErrorType

/**
 * Gets the reverse record (primary name) for an address by reading directly from
 * the L1 ENS registry and resolver, bypassing the Universal Resolver and CCIP-read.
 *
 * Useful as a fallback when `getName` returns null due to Universal Resolver
 * errors, but the reverse record still exists on-chain.
 *
 * @param client - {@link Client}
 * @param parameters - {@link GetReverseRecordFromRegistryParameters}
 * @returns Name and reverse resolver address, or `null` if no reverse record is set. {@link GetReverseRecordFromRegistryReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getReverseRecordFromRegistry } from '@ensdomains/ensjs/public'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getReverseRecordFromRegistry(client, { address: '0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5' })
 * // { name: 'nick.eth', reverseResolverAddress: '0xa2c122be93b0074270ebee7f6b7292c7deb45047' }
 */
export async function getReverseRecordFromRegistry<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensRegistry'>,
  { address }: GetReverseRecordFromRegistryParameters,
): Promise<GetReverseRecordFromRegistryReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const reverseNode = `${address.toLowerCase().slice(2)}.addr.reverse`
  const nodeHash = namehash(reverseNode)
  const registryAddress = getChainContractAddress({
    chain: client.chain,
    contract: 'ensRegistry',
  })
  const readContractAction = getAction(client, readContract, 'readContract')

  const resolverAddress = await readContractAction({
    address: registryAddress,
    abi: registryResolverSnippet,
    functionName: 'resolver',
    args: [nodeHash],
  })

  if (!resolverAddress || resolverAddress === zeroAddress) return null

  const name = await readContractAction({
    address: resolverAddress,
    abi: permissionedResolverNameSnippet,
    functionName: 'name',
    args: [nodeHash],
  })

  if (!name || name === '') return null

  return { name, reverseResolverAddress: resolverAddress }
}
