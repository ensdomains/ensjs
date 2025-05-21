import {
  type Address,
  type Chain,
  type Client,
  type GetChainContractAddressErrorType,
  type Hex,
  type ReadContractErrorType,
  type ToHexErrorType,
  type Transport,
  toHex,
  zeroAddress,
} from 'viem'
import { readContract } from 'viem/actions'
import { packetToBytes, type PacketToBytesErrorType } from 'viem/ens'
import { getAction } from 'viem/utils'

import type { ChainWithContract } from '../../contracts/consts.js'
import {
  universalResolverResolveArraySnippet,
  universalResolverResolveArrayWithGatewaysSnippet,
  universalResolverResolveSnippet,
  universalResolverResolveWithGatewaysSnippet,
} from '../../contracts/universalResolver.js'
import { isNullUniversalResolverError } from '../../utils/errors/isNullUniversalResolverError.js'
import {
  getNameWithSizedLabels,
  type GetNameWithSizedLabelsErrorType,
} from '../../utils/name/getNameWithSizedLabels.js'
import {
  getChainContractAddress,
  type RequireClientContracts,
} from '../../clients/chain.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'

export type ResolveNameDataParameters<data extends Hex | Hex[]> = {
  name: string
  data: data
  strict?: boolean
  gatewayUrls?: string[]
}

type ResultArray = readonly { success: boolean; returnData: Hex }[]

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
        const arrayParameters = {
          ...baseParameters,
          abi: universalResolverResolveArraySnippet,
          args: [toHex(packetToBytes(nameWithSizedLabels)), data as Hex[]],
        } as const

        return gatewayUrls
          ? readContractAction({
              ...arrayParameters,
              abi: universalResolverResolveArrayWithGatewaysSnippet,
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
            args: [...parameters.args, gatewayUrls],
          })
        : readContractAction(parameters)
    })()

    if (resolverAddress === zeroAddress) return null
    return { resolvedData, resolverAddress } as ResolveNameDataReturnType<data>
  } catch (error) {
    if (strict) throw error
    if (isNullUniversalResolverError(error)) return null
    throw error
  }
}
