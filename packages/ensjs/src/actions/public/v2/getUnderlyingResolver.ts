import type { Client, ReadContractErrorType } from 'viem'
import type { Address } from 'viem/accounts'
import { readContract } from 'viem/actions'
import { type PacketToBytesErrorType, packetToBytes } from 'viem/ens'
import { bytesToHex, getAction } from 'viem/utils'
import { compositeResolverGetResolver } from '../../../contracts/compositeResolver.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'

export type GetUnderlyingResolverParameters = {
  resolverAddress: Address

  name: string
}

export type GetUnderlyingResolverReturnType = readonly [Address, boolean]

export type GetUnderlyingResolverErrorType =
  | ReadContractErrorType
  | PacketToBytesErrorType

/**
 * Finds the underlying non-mainnet resolver address via offchain lookup.
 * @param client - {@link Client}
 * @param parameters - {@link GetUnderlyingResolverParameters}
 * @returns Resolver address, or null if none is found, and whether it's on mainnet or not. {@link GetUnderlyingResolverReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getUnderlyingAddress } from '@ensdomains/ensjs/public/v2'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getUnderlyingAddress(client, { resolverAddress: '0x123' })
 * // ['0x352d7aA7a8bd0F6f31635BE5ceCb6Cebb6929A15', false]
 */
export async function getUnderlyingAddress(
  client: Client,
  { resolverAddress, name }: GetUnderlyingResolverParameters,
): Promise<GetUnderlyingResolverReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')
  return await readContractAction({
    address: resolverAddress,
    abi: compositeResolverGetResolver,
    functionName: 'getResolver',
    args: [bytesToHex(packetToBytes(name))],
  })
}
