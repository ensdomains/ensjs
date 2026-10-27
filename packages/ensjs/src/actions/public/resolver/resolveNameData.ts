import { compositeResolverGetResolver } from '@ensdomains/ensjs-abi/compositeResolver'
import { erc165SupportsInterfaceSnippet } from '@ensdomains/ensjs-abi/erc165'
import { multicallSnippet } from '@ensdomains/ensjs-abi/multicall'
import {
  universalResolverFindResolverSnippet,
  universalResolverResolveSnippet,
  universalResolverResolveWithGatewaysSnippet,
} from '@ensdomains/ensjs-abi/universalResolver'
import {
  type Address,
  BaseError,
  type Chain,
  type Client,
  ContractFunctionRevertedError,
  decodeFunctionResult,
  encodeFunctionData,
  type GetChainContractAddressErrorType,
  type Hex,
  parseAbi,
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
} from '../../../clients/chain.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import { isNullUniversalResolverError } from '../../../utils/errors/isNullUniversalResolverError.js'
import {
  type GetNameWithSizedLabelsErrorType,
  getNameWithSizedLabels,
} from '../../../utils/name/getNameWithSizedLabels.js'

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

const extendedResolverAbi = parseAbi([
  'function resolve(bytes name, bytes data) view returns (bytes)',
  'function supportsFeature(bytes4 feature) view returns (bool)',
])
const COMPOSITE_RESOLVER_INTERFACE_ID = '0xeea330f9'
const EXTENDED_RESOLVER_INTERFACE_ID = '0x9061b923'
const ERC7996_INTERFACE_ID = '0x582de3e7'
const RESOLVE_MULTICALL_FEATURE = '0x96b62db8'
const OFFCHAIN_LOOKUP_SELECTOR = '0x556f1830'

const decodeResults = (data: Hex): ResultArray =>
  decodeFunctionResult({ abi: multicallSnippet, data }).map(
    (returnData): Result => ({
      success: returnData !== '0x' && (returnData.length - 2) % 64 === 0,
      returnData,
    }),
  )

const isOffchainLookup = (error: unknown) => {
  const revert =
    error instanceof BaseError
      ? error.walk((cause) => cause instanceof ContractFunctionRevertedError)
      : null
  return (
    revert instanceof ContractFunctionRevertedError &&
    (revert.raw?.slice(0, 10) === OFFCHAIN_LOOKUP_SELECTOR ||
      revert.signature === OFFCHAIN_LOOKUP_SELECTOR)
  )
}

/**
 * The resolver to send one `resolve(name, multicall)` to, or null to leave the
 * batch to the universal resolver: it already forwards it whole to a resolver
 * advertising ERC-7996 `RESOLVE_MULTICALL`, and splits it for any other.
 * `resolver` is the one the universal resolver reports.
 */
const getBatchResolver = async (
  client: Client,
  {
    universalResolver,
    dnsName,
    blockNumber,
  }: { universalResolver: Address; dnsName: Hex; blockNumber?: bigint },
): Promise<{ resolver: Address; target: Address } | null> => {
  const supports = (address: Address, interfaceId: Hex) =>
    readContract(client, {
      address,
      abi: erc165SupportsInterfaceSnippet,
      functionName: 'supportsInterface',
      args: [interfaceId],
      blockNumber,
    }).catch(() => false)

  const [resolver] = await readContract(client, {
    address: universalResolver,
    abi: universalResolverFindResolverSnippet,
    functionName: 'findResolver',
    args: [dnsName],
    blockNumber,
  })
  if (resolver === zeroAddress) return null

  // A composite resolver (the ENSv1 mirror) forwards to the one that answers.
  let target = resolver
  if (await supports(resolver, COMPOSITE_RESOLVER_INTERFACE_ID)) {
    const [underlying, offchain] = await readContract(client, {
      address: resolver,
      abi: compositeResolverGetResolver,
      functionName: 'getResolver',
      args: [dnsName],
      blockNumber,
    })
    // One located through DNS needs its TXT record as context.
    if (offchain || underlying === zeroAddress) return null
    target = underlying
  }

  const [isExtended, isErc7996] = await Promise.all([
    supports(target, EXTENDED_RESOLVER_INTERFACE_ID),
    supports(target, ERC7996_INTERFACE_ID),
  ])
  if (!isExtended) return null
  const batchesAlready =
    isErc7996 &&
    (await readContract(client, {
      address: target,
      abi: extendedResolverAbi,
      functionName: 'supportsFeature',
      args: [RESOLVE_MULTICALL_FEATURE],
      blockNumber,
    }).catch(() => false))
  return batchesAlready ? null : { resolver, target }
}

/**
 * Reads `data` in one gateway request where the resolver allows it, or returns
 * null to use the universal resolver. An onchain name answers the first call.
 */
const resolveMulticall = async (
  client: Client,
  {
    universalResolver,
    dnsName,
    data,
    blockNumber,
  }: {
    universalResolver: Address
    dnsName: Hex
    data: Hex[]
    blockNumber?: bigint
  },
) => {
  const multicallData = encodeFunctionData({
    abi: multicallSnippet,
    functionName: 'multicall',
    args: [data],
  })
  // Without CCIP-Read, and without the client's bound actions, which ignore it.
  const withoutCcipRead = {
    ...client,
    ccipRead: false,
    call: undefined,
    readContract: undefined,
  } as Client

  const onchain = await readContract(withoutCcipRead, {
    address: universalResolver,
    abi: universalResolverResolveSnippet,
    functionName: 'resolve',
    args: [dnsName, multicallData],
    blockNumber,
  }).catch((error: unknown) => {
    if (isOffchainLookup(error)) return null
    throw error
  })
  if (onchain) {
    const [resolvedData, resolverAddress] = onchain
    if (resolverAddress === zeroAddress) return null
    return { resolvedData: decodeResults(resolvedData), resolverAddress }
  }

  const batchResolver = await getBatchResolver(withoutCcipRead, {
    universalResolver,
    dnsName,
    blockNumber,
  })
  if (!batchResolver) return null
  const resolvedData = decodeResults(
    await getAction(
      client,
      readContract,
      'readContract',
    )({
      address: batchResolver.target,
      abi: extendedResolverAbi,
      functionName: 'resolve',
      args: [dnsName, multicallData],
      blockNumber,
    }),
  )
  if (resolvedData.length !== data.length) return null
  return { resolvedData, resolverAddress: batchResolver.resolver }
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

  const universalResolver = getChainContractAddress({
    chain: client.chain,
    contract: 'ensUniversalResolver',
  })
  const baseParameters = {
    address: universalResolver,
    functionName: 'resolve',
    blockNumber,
  } as const

  // A gateway answers each record of a split batch separately, and rate-limits
  // per client; ask once where the resolver can answer the whole batch.
  if (Array.isArray(data) && data.length > 1 && !gatewayUrls) {
    const batched = await resolveMulticall(client, {
      universalResolver,
      dnsName: toHex(packetToBytes(nameWithSizedLabels)),
      data: data as Hex[],
      blockNumber,
    }).catch(() => null)
    if (batched) return batched as ResolveNameDataReturnType<data>
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
