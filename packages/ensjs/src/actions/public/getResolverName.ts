import type { Client } from 'viem'
import type { Address } from 'viem/accounts'
import { type ReadContractErrorType, readContract } from 'viem/actions'
import { getAction, padHex } from 'viem/utils'
import { dedicatedResolverNameSnippet } from '../../contracts/dedicatedResolver.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'

export type GetResolverNameParameters = {
  /** Name to get resolver for */
  resolverAddress: Address
}

export type GetResolverNameReturnType = string | null

export type GetResolverNameErrorType = ReadContractErrorType

/**
 * Gets the name of a dedicated resolver.
 * @param client - {@link Client}
 * @param parameters - {@link GetResolverNameParameters}
 * @returns Resolver address, or null if none is found. {@link GetResolverNameReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { GetResolverName } from '@ensdomains/ensjs/public'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getResolverName(client, { resolverAddress: '0x123' })
 * // l2name.eth
 */
export async function getResolverName(
  client: Client,
  { resolverAddress }: GetResolverNameParameters,
): Promise<GetResolverNameReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')
  const result = await readContractAction({
    address: resolverAddress,
    abi: dedicatedResolverNameSnippet,
    functionName: 'name',
    args: [padHex('0x0', { size: 32 })],
  })

  return result
}
