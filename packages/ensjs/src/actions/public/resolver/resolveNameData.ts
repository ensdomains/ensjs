import { erc165SupportsInterfaceSnippet } from '@ensdomains/ensjs-abi/erc165'
import { multicallSnippet } from '@ensdomains/ensjs-abi/multicall'
import {
  universalResolverResolveSnippet,
  universalResolverResolveWithGatewaysSnippet,
} from '@ensdomains/ensjs-abi/universalResolver'
import { permissionedResolverResolveSnippet } from '@ensdomains/ensjs-abi/v2/permissionedResolver'
import {
  type Address,
  type Chain,
  type Client,
  createClient,
  custom,
  decodeFunctionResult,
  encodeFunctionData,
  type GetChainContractAddressErrorType,
  type Hex,
  type ReadContractErrorType,
  type ToHexErrorType,
  type Transport,
  toHex,
  zeroAddress,
} from 'viem'
import { readContract } from 'viem/actions'
import { type PacketToBytesErrorType, packetToBytes } from 'viem/ens'
import { getAction } from 'viem/utils'
import {
  type ChainWithContracts,
  getChainContractAddress,
  type RequireClientContracts,
} from '../../../clients/chain.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import { isNullUniversalResolverError } from '../../../utils/errors/isNullUniversalResolverError.js'
import { isOffchainLookupError } from '../../../utils/errors/isOffchainLookupError.js'
import {
  type GetNameWithSizedLabelsErrorType,
  getNameWithSizedLabels,
} from '../../../utils/name/getNameWithSizedLabels.js'
import { getResolver } from './getResolver.js'

export type ResolveNameDataParameters<data extends Hex | Hex[]> = {
  name: string
  data: data
  strict?: boolean
  gatewayUrls?: string[]
  /** Block number to read at. CCIP-read (offchain) responses are not pinned to this block. */
  blockNumber?: bigint
}

type Result = { success: boolean; returnData: Hex }
type ResultArray = readonly Result[]

export type ResolveNameDataReturnType<data extends Hex | Hex[]> = {
  resolvedData: data extends Hex[] ? ResultArray : Hex
  resolverAddress: Address
} | null

export type ResolveNameDataErrorType =
  | GetNameWithSizedLabelsErrorType
  | ReadContractErrorType
  | GetChainContractAddressErrorType
  | ToHexErrorType
  | PacketToBytesErrorType

const EXTENDED_RESOLVER_INTERFACE_ID = '0x9061b923'

const decodeResults = (data: Hex): ResultArray =>
  decodeFunctionResult({ abi: multicallSnippet, data }).map(
    (returnData): Result => ({
      success: returnData !== '0x' && (returnData.length - 2) % 64 === 0,
      returnData,
    }),
  )

/**
 * The ENSIP-10 resolver to send a whole `resolve(name, multicall)` to, or null.
 * The universal resolver splits a batch per record (one gateway request each),
 * even for a resolver advertising ERC-7996 `RESOLVE_MULTICALL`.
 */
const getMulticallResolver = async (
  client: Client<Transport, ChainWithContracts<'ensUniversalResolver'>>,
  { name, blockNumber }: { name: string; blockNumber?: bigint },
): Promise<Address | null> => {
  const resolver = await getAction(
    client,
    getResolver,
    'getResolver',
  )({ name, blockNumber })
  if (!resolver) return null

  const isExtended = await getAction(
    client,
    readContract,
    'readContract',
  )({
    address: resolver,
    abi: erc165SupportsInterfaceSnippet,
    functionName: 'supportsInterface',
    args: [EXTENDED_RESOLVER_INTERFACE_ID],
    blockNumber,
  }).catch(() => false)
  return isExtended ? resolver : null
}

/**
 * Reads a multicall in one gateway request where the resolver can answer it
 * whole, or returns null to leave it to the universal resolver. Probing without
 * CCIP-Read first means an onchain name costs the same single call as before.
 */
const resolveMulticall = async (
  client: Client<Transport, ChainWithContracts<'ensUniversalResolver'>>,
  {
    name,
    multicallData,
    blockNumber,
  }: { name: string; multicallData: Hex; blockNumber?: bigint },
) => {
  const dnsName = toHex(packetToBytes(name))
  // The same transport, without the client's CCIP-Read handling.
  const withoutCcipRead = createClient({
    chain: client.chain,
    transport: custom({ request: client.request }, { retryCount: 0 }),
    ccipRead: false,
  })
  const onchain = await readContract(withoutCcipRead, {
    address: getChainContractAddress({
      chain: client.chain,
      contract: 'ensUniversalResolver',
    }),
    abi: universalResolverResolveSnippet,
    functionName: 'resolve',
    args: [dnsName, multicallData],
    blockNumber,
  }).catch((error: unknown) => {
    if (isOffchainLookupError(error)) return null
    throw error
  })
  if (onchain) {
    const [resolvedData, resolverAddress] = onchain
    if (resolverAddress === zeroAddress) return null
    return { resolvedData: decodeResults(resolvedData), resolverAddress }
  }

  const resolver = await getMulticallResolver(client, { name, blockNumber })
  if (!resolver) return null
  const resolvedData = await getAction(
    client,
    readContract,
    'readContract',
  )({
    address: resolver,
    abi: permissionedResolverResolveSnippet,
    functionName: 'resolve',
    args: [dnsName, multicallData],
    blockNumber,
  })
  return {
    resolvedData: decodeResults(resolvedData),
    resolverAddress: resolver,
  }
}

/**
 * Resolves name and data with the universal resolver.
 * @param client - {@link Client}
 * @param parameters - {@link ResolveParameters}
 * @returns {@link ResolveReturnType}
 * @internal
 */
export async function resolveNameData<
  chain extends Chain,
  data extends Hex | Hex[],
>(
  client: RequireClientContracts<chain, 'ensUniversalResolver'>,
  {
    name,
    data,
    strict,
    gatewayUrls,
    blockNumber,
  }: ResolveNameDataParameters<data>,
): Promise<ResolveNameDataReturnType<data>> {
  ASSERT_NO_TYPE_ERROR(client)

  const nameWithSizedLabels = getNameWithSizedLabels(name)
  const readContractAction = getAction(client, readContract, 'readContract')

  const baseParameters = {
    address: getChainContractAddress({
      chain: client.chain,
      contract: 'ensUniversalResolver',
    }),
    functionName: 'resolve',
    blockNumber,
  } as const

  // A gateway answers each record of a split batch separately and rate-limits
  // per client; ask once where the resolver can answer the whole batch.
  if (Array.isArray(data) && data.length > 1 && !gatewayUrls) {
    const batched = await resolveMulticall(client, {
      name: nameWithSizedLabels,
      multicallData: encodeFunctionData({
        abi: multicallSnippet,
        functionName: 'multicall',
        args: [data as Hex[]],
      }),
      blockNumber,
    }).catch(() => null)
    if (batched?.resolvedData.length === data.length)
      return batched as ResolveNameDataReturnType<data>
  }

  try {
    const [resolvedData, resolverAddress] = await (() => {
      if (Array.isArray(data)) {
        const multicallData = encodeFunctionData({
          abi: multicallSnippet,
          functionName: 'multicall',
          args: [data as Hex[]],
        })

        const arrayParameters = {
          ...baseParameters,
          abi: universalResolverResolveSnippet,
          args: [toHex(packetToBytes(nameWithSizedLabels)), multicallData],
        } as const

        return gatewayUrls
          ? readContractAction({
              ...arrayParameters,
              abi: universalResolverResolveWithGatewaysSnippet,
              functionName: 'resolveWithGateways',
              args: [...arrayParameters.args, gatewayUrls],
            })
          : readContractAction(arrayParameters)
      }

      const parameters = {
        ...baseParameters,
        abi: universalResolverResolveSnippet,
        args: [toHex(packetToBytes(nameWithSizedLabels)), data as Hex],
      } as const

      return gatewayUrls
        ? readContractAction({
            ...parameters,
            abi: universalResolverResolveWithGatewaysSnippet,
            functionName: 'resolveWithGateways',
            args: [...parameters.args, gatewayUrls] as const,
          })
        : readContractAction(parameters)
    })()

    if (resolverAddress === zeroAddress) return null
    if (Array.isArray(data)) {
      return {
        resolvedData: decodeResults(resolvedData),
        resolverAddress,
      } as ResolveNameDataReturnType<data>
    }
    return { resolvedData, resolverAddress } as ResolveNameDataReturnType<data>
  } catch (error) {
    if (strict) throw error
    if (isNullUniversalResolverError(error)) return null
    throw error
  }
}
