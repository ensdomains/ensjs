import {
  type Address,
  type Chain,
  decodeFunctionResult,
  encodeFunctionData,
  type GetChainContractAddressErrorType,
  type Hex,
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
import { multicallSnippet } from '../../contracts/multicall.js'
import {
  universalResolverResolveSnippet,
  universalResolverResolveWithGatewaysSnippet,
} from '../../contracts/universalResolver.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'
import { isNullUniversalResolverError } from '../../utils/errors/isNullUniversalResolverError.js'
import {
  type GetNameWithSizedLabelsErrorType,
  getNameWithSizedLabels,
} from '../../utils/name/getNameWithSizedLabels.js'

export type ResolveNameDataParameters<data extends Hex | Hex[]> = {
  name: string
  data: data
  strict?: boolean
  gatewayUrls?: string[]
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
  { name, data, strict, gatewayUrls }: ResolveNameDataParameters<data>,
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
  } as const

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
        resolvedData: decodeFunctionResult({
          abi: multicallSnippet,
          data: resolvedData,
        }).map((r): Result => {
          if (r === '0x') {
            return { success: false, returnData: r }
          }
          return (r.length & 31) === 4
            ? { success: true, returnData: r }
            : { success: false, returnData: r }
        }) as ResultArray,
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
