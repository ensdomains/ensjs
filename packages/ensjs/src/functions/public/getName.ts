import {
  getAddress,
  toHex,
  type Address,
  type Client,
  type Transport,
} from 'viem'
import { readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import type { ChainWithContract } from '../../contracts/consts.js'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import {
  universalResolverReverseSnippet,
  universalResolverReverseWithGatewaysSnippet,
} from '../../contracts/universalResolver.js'
import { isNullUniversalResolverError } from '../../utils/errors/isNullUniversalResolverError.js'
import { packetToBytes } from '../../utils/hexEncodedName.js'
import { normalise } from '../../utils/normalise.js'
import { nullableAddress } from '../../utils/nullableAddress.js'

export type GetNameParameters = {
  /** Address to get name for */
  address: Address
  /** Whether or not to allow mismatched forward resolution */
  allowMismatch?: boolean
  /** Whether or not to allow unnormalised name results (UNSAFE) */
  allowUnnormalised?: boolean
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
  /** Indicates if name is normalised */
  normalised: boolean
  /** Resolver address for reverse node */
  reverseResolverAddress: Address | null
  /** Resolver address for resolved name */
  resolverAddress: Address | null
} | null

export type GetNameErrorType = Error

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
export async function getName<
  chain extends ChainWithContract<'ensUniversalResolver'>,
>(
  client: Client<Transport, chain>,
  {
    address,
    allowMismatch,
    allowUnnormalised,
    strict,
    gatewayUrls,
  }: GetNameParameters,
): Promise<GetNameReturnType> {
  const reverseNode = `${address.toLowerCase().substring(2)}.addr.reverse`
  const readContractAction = getAction(client, readContract, 'readContract')

  const parameters = {
    address: getChainContractAddress({
      client,
      contract: 'ensUniversalResolver',
    }),
    abi: universalResolverReverseSnippet,
    functionName: 'reverse',
    args: [toHex(packetToBytes(reverseNode))],
  } as const
  try {
    const [
      unnormalisedName,
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
    if (!unnormalisedName) return null

    const addressMatch =
      getAddress(forwardResolvedAddress) === getAddress(address)
    if (!addressMatch && !allowMismatch) return null

    const normalisedName = normalise(unnormalisedName)
    const nameMatch = unnormalisedName === normalisedName
    if (!nameMatch && !allowUnnormalised) return null

    return {
      name: unnormalisedName,
      match: addressMatch,
      normalised: nameMatch,
      reverseResolverAddress: nullableAddress(reverseResolverAddress),
      resolverAddress: nullableAddress(resolverAddress),
    }
  } catch (error) {
    if (strict) throw error
    if (isNullUniversalResolverError(error)) return null
    throw error
  }
}
