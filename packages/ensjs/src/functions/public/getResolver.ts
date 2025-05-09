import {
  toHex,
  zeroAddress,
  type Address,
  type Client,
  type Transport,
} from 'viem'
import { readContract } from 'viem/actions'
import { packetToBytes } from 'viem/ens'
import { getAction } from 'viem/utils'

import type { ChainWithContract } from '../../contracts/consts.js'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import { universalResolverFindResolverSnippet } from '../../contracts/universalResolver.js'

export type GetResolverParameters = {
  /** Name to get resolver for */
  name: string
}

export type GetResolverReturnType = Address | null

export type GetResolverErrorType = Error

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
export async function getResolver<
  chain extends ChainWithContract<'ensUniversalResolver'>,
>(
  client: Client<Transport, chain>,
  { name }: GetResolverParameters,
): Promise<GetResolverReturnType> {
  const readContractAction = getAction(client, readContract, 'readContract')
  const result = await readContractAction({
    address: getChainContractAddress({
      client,
      contract: 'ensUniversalResolver',
    }),
    abi: universalResolverFindResolverSnippet,
    functionName: 'findResolver',
    args: [toHex(packetToBytes(name))],
  })

  if (result[0] === zeroAddress) return null
  return result[0]
}
