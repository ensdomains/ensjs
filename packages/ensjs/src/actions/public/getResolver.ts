import { compositeResolverGetResolver } from '@ensdomains/ensjs-abi/compositeResolver'
import { erc165SupportsInterfaceSnippet } from '@ensdomains/ensjs-abi/erc165'
import { universalResolverFindResolverSnippet } from '@ensdomains/ensjs-abi/universalResolver'
import {
  type Address,
  type Chain,
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
} from '../../clients/shared.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'

// ICompositeResolver interface id (ERC-165). A composite resolver (e.g. the
// ENSv1 mirror resolver the Universal Resolver reports for unmigrated v1
// names) delegates to an underlying resolver, exposed via `getResolver(name)`.
const COMPOSITE_RESOLVER_INTERFACE_ID = '0xeea330f9'

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
 *
 * Returns the address records should be read from and written to. The Universal
 * Resolver locates the resolver bound to the name; when that resolver is a
 * composite resolver (it delegates to an underlying resolver, such as the ENSv1
 * mirror used for unmigrated v1 names), the underlying resolver is returned so
 * callers get a writable resolver. A plain (non-composite) resolver is already
 * final and is returned as-is.
 *
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
  const encodedName = toHex(packetToBytes(name))
  const [resolver] = await readContractAction({
    address: getChainContractAddress({
      chain: client.chain,
      contract: 'ensUniversalResolver',
    }),
    abi: universalResolverFindResolverSnippet,
    functionName: 'findResolver',
    args: [encodedName],
  })

  if (resolver === zeroAddress) return null

  // A composite resolver delegates to an underlying resolver; unwrap it to the
  // final (writable) resolver. Non-composite resolvers are already final.
  const isComposite = await readContractAction({
    address: resolver,
    abi: erc165SupportsInterfaceSnippet,
    functionName: 'supportsInterface',
    args: [COMPOSITE_RESOLVER_INTERFACE_ID],
  }).catch(() => false)

  if (!isComposite) return resolver

  const [underlyingResolver] = await readContractAction({
    address: resolver,
    abi: compositeResolverGetResolver,
    functionName: 'getResolver',
    args: [encodedName],
  })

  return underlyingResolver === zeroAddress ? null : underlyingResolver
}
