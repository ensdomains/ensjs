import {
  type Address,
  type Chain,
  type GetAddressErrorType,
  type GetChainContractAddressErrorType,
  getAddress,
  type ReadContractErrorType,
  type ToHexErrorType,
  toHex,
} from 'viem'
import { readContract } from 'viem/actions'
import { type PacketToBytesErrorType, packetToBytes } from 'viem/ens'
import { getAction } from 'viem/utils'
import {
  getChainContractAddress,
  type RequireClientContracts,
} from '../../clients/chain.js'
import {
  universalResolverReverseSnippet,
  universalResolverReverseWithGatewaysSnippet,
} from '../../contracts/universalResolver.js'
import type { ErrorType } from '../../errors/utils.js'
import type { ExcludeTE } from '../../types/internal.js'
import { isNullUniversalResolverError } from '../../utils/errors/isNullUniversalResolverError.js'
import {
  type NormalizeErrorType,
  normalize,
} from '../../utils/name/normalize.js'
import { nullableAddress } from '../../utils/nullableAddress.js'

export type GetNameParameters = {
  /** Address to get name for */
  address: Address
  /** Whether or not to allow mismatched forward resolution */
  allowMismatch?: boolean
  /** Whether or not to allow unnormalized name results (UNSAFE) */
  allowUnnormalized?: boolean
  /** Whether or not to throw decoding errors */
  strict?: boolean
  /** Batch gateway URLs to use for resolving CCIP-read requests. */
  gatewayUrls?: string[]
}

export type GetNameReturnType = {
  /** Primary name for address */
  name: string
  /** Indicates if forward resolution for name matches address */
  match: boolean
  /** Indicates if name is normalized */
  normalized: boolean
  /** Resolver address for reverse node */
  reverseResolverAddress: Address | null
  /** Resolver address for resolved name */
  resolverAddress: Address | null
} | null

export type GetNameErrorType =
  | ReadContractErrorType
  | GetChainContractAddressErrorType
  | ToHexErrorType
  | PacketToBytesErrorType
  | GetAddressErrorType
  | NormalizeErrorType
  | ErrorType

/**
 * Gets the primary name for an address
 * @param client - {@link Client}
 * @param parameters - {@link GetNameParameters}
 * @returns Name data object, or `null` if no primary name is set. {@link GetNameReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getName } from '@ensdomains/ensjs/public'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getName(client, { address: '0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5' })
 * // { name: 'nick.eth', match: true, reverseResolverAddress: '0xa2c122be93b0074270ebee7f6b7292c7deb45047', resolverAddress: '0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41' }
 */
export async function getName<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensUniversalResolver'>,
  {
    address,
    allowMismatch,
    allowUnnormalized,
    strict,
    gatewayUrls,
  }: GetNameParameters,
): Promise<GetNameReturnType> {
  client = client as ExcludeTE<typeof client>

  const reverseNode = `${address.toLowerCase().substring(2)}.addr.reverse`
  const readContractAction = getAction(client, readContract, 'readContract')

  const parameters = {
    address: getChainContractAddress({
      chain: client.chain,
      contract: 'ensUniversalResolver',
    }),
    abi: universalResolverReverseSnippet,
    functionName: 'reverse',
    args: [toHex(packetToBytes(reverseNode))],
  } as const
  try {
    const [
      unnormalizedName,
      forwardResolvedAddress,
      reverseResolverAddress,
      resolverAddress,
    ] = gatewayUrls
      ? await readContractAction({
          ...parameters,
          abi: universalResolverReverseWithGatewaysSnippet,
          args: [...parameters.args, gatewayUrls],
        })
      : await readContractAction(parameters)
    if (!unnormalizedName) return null

    const addressMatch =
      getAddress(forwardResolvedAddress) === getAddress(address)
    if (!addressMatch && !allowMismatch) return null

    const normalizedName = normalize(unnormalizedName)
    const nameMatch = unnormalizedName === normalizedName
    if (!nameMatch && !allowUnnormalized) return null

    return {
      name: unnormalizedName,
      match: addressMatch,
      normalized: nameMatch,
      reverseResolverAddress: nullableAddress(reverseResolverAddress),
      resolverAddress: nullableAddress(resolverAddress),
    }
  } catch (error) {
    if (strict) throw error
    if (isNullUniversalResolverError(error)) return null
    throw error
  }
}
