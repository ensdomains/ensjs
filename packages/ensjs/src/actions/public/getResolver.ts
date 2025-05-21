import {
  type Address,
  type Chain,
  type Client,
  type GetChainContractAddressErrorType,
  type ReadContractErrorType,
  type ToHexErrorType,
  toHex,
  zeroAddress,
} from 'viem'
import { readContract } from 'viem/actions'
import { type PacketToBytesErrorType, packetToBytes } from 'viem/ens'
import { getAction } from 'viem/utils'
import {
  getChainContractAddress,
  type RequireClientContracts,
} from '../../clients/chain.js'
import { universalResolverFindResolverSnippet } from '../../contracts/universalResolver.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'

export type GetResolverParameters = {
  /** Name to get resolver for */
  name: string
}

export type GetResolverReturnType = Address | null

export type GetResolverErrorType =
  | ReadContractErrorType
  | GetChainContractAddressErrorType
  | ToHexErrorType
  | PacketToBytesErrorType

/**
 * Gets the resolver address for a name.
 * @param client - {@link Client}
 * @param parameters - {@link GetResolverParameters}
 * @returns Resolver address, or null if none is found. {@link GetResolverReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getResolver } from '@ensdomains/ensjs/public'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getResolver(client, { name: 'ens.eth' })
 * // 0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41
 */
export async function getResolver<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensUniversalResolver'>,
  { name }: GetResolverParameters,
): Promise<GetResolverReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')
  const result = await readContractAction({
    address: getChainContractAddress({
      chain: client.chain,
      contract: 'ensUniversalResolver',
    }),
    abi: universalResolverFindResolverSnippet,
    functionName: 'findResolver',
    args: [toHex(packetToBytes(name))],
  })

  if (result[0] === zeroAddress) return null
  return result[0]
}
