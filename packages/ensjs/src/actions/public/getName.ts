import { evmChainIdToCoinType } from '@ensdomains/address-encoder/utils'
import type {
  Address,
  Chain,
  GetAddressErrorType,
  GetChainContractAddressErrorType,
  ReadContractErrorType,
  ToHexErrorType,
} from 'viem'
import { readContract } from 'viem/actions'
import type { PacketToBytesErrorType } from 'viem/ens'
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

type GetNameCoinTypeParameters = {
  coinType: number
  chainId?: never
}

type GetNameChainIdParameters = {
  chainId: number
  coinType?: never
}

export type GetNameParameters = {
  /** Address to get name for */
  address: Address
  /** Whether or not to allow unnormalized name results (UNSAFE) */
  allowUnnormalized?: boolean
  /** Whether or not to throw decoding errors */
  strict?: boolean
  /** Batch gateway URLs to use for resolving CCIP-read requests. */
  gatewayUrls?: string[]
  /** Coin type to use for reverse resolution */
  coinType?: GetNameCoinTypeParameters['coinType']
  /** Chain ID to use for reverse resolution */
  chainId?: GetNameChainIdParameters['chainId']
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
    allowUnnormalized,
    strict,
    gatewayUrls,
    chainId,
    coinType,
  }: GetNameParameters,
): Promise<GetNameReturnType> {
  client = client as ExcludeTE<typeof client>

  const readContractAction = getAction(client, readContract, 'readContract')

  const parameters = {
    address: getChainContractAddress({
      chain: client.chain,
      contract: 'ensUniversalResolver',
    }),
    abi: universalResolverReverseSnippet,
    functionName: 'reverseWithGateways',
    args: [address, chainId ? evmChainIdToCoinType(chainId) : coinType || 60n],
  } as const
  try {
    const [unnormalisedName, resolverAddress, reverseResolverAddress] =
      gatewayUrls
        ? await readContractAction({
            ...parameters,
            abi: universalResolverReverseWithGatewaysSnippet,
            args: [...parameters.args, gatewayUrls] as const,
          })
        : await readContractAction({ ...parameters, functionName: 'reverse' })
    if (!unnormalisedName) return null

    const normalizedName = normalize(unnormalisedName)
    const nameMatch = unnormalisedName === normalizedName
    if (!nameMatch && !allowUnnormalized) return null

    return {
      name: unnormalisedName,
      match: true,
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
