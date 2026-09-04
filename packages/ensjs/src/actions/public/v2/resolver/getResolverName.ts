import {
  nameResolverNameSnippet,
  permissionedResolverResolveSnippet,
} from '@ensdomains/ensjs-abi/v2/permissionedResolver'
import type { Client } from 'viem'
import type { Address } from 'viem/accounts'
import { type ReadContractErrorType, readContract } from 'viem/actions'
import {
  decodeFunctionResult,
  encodeFunctionData,
  getAction,
  padHex,
} from 'viem/utils'
import { ASSERT_NO_TYPE_ERROR } from '../../../../types/internal.js'

/** The DNS-encoded root name: the resolver's default record. */
const ROOT_DNS_NAME = '0x00' as const

export type GetResolverNameParameters = {
  resolverAddress: Address
}

export type GetResolverNameReturnType = string | null

export type GetResolverNameErrorType = ReadContractErrorType

/**
 * Gets the name of a permissioned resolver: the `name` record of its default
 * record (the one written against the root name), read through ENSIP-10
 * `resolve` since the post-audit-2 resolver has no direct `name(node)` getter.
 * @param client - {@link Client}
 * @param parameters - {@link GetResolverNameParameters}
 * @returns Resolver address, or null if none is found. {@link GetResolverNameReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getResolverName } from '@ensdomains/ensjs/public/v2'
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
    abi: permissionedResolverResolveSnippet,
    functionName: 'resolve',
    args: [
      ROOT_DNS_NAME,
      encodeFunctionData({
        abi: nameResolverNameSnippet,
        functionName: 'name',
        args: [padHex('0x0', { size: 32 })],
      }),
    ],
  })

  const name = decodeFunctionResult({
    abi: nameResolverNameSnippet,
    functionName: 'name',
    data: result,
  })
  return name || null
}
