import {
  toHex,
  zeroAddress,
  type Address,
  type Client,
  type Hex,
  type Transport,
} from 'viem'
import { readContract } from 'viem/actions'
import { getAction } from 'viem/utils'

import type { ChainWithContract } from '../../contracts/consts.js'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import {
  universalResolverResolveArraySnippet,
  universalResolverResolveArrayWithGatewaysSnippet,
  universalResolverResolveSnippet,
  universalResolverResolveWithGatewaysSnippet,
} from '../../contracts/universalResolver.js'
import { isNullUniversalResolverError } from '../../utils/errors/isNullUniversalResolverError.js'
import { packetToBytes } from '../../utils/hexEncodedName.js'
import { getNameWithSizedLabels } from '../../utils/name/getNameWithSizedLabels.js'

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

export type ResolveNameDataErrorType = Error

/**
 * Resolves name and data with the universal resolver.
 * @param client - {@link Client}
 * @param parameters - {@link ResolveParameters}
 * @returns {@link ResolveReturnType}
 * @internal
 */
export async function resolveNameData<
  chain extends ChainWithContract<'ensUniversalResolver'>,
  data extends Hex | Hex[],
>(
  client: Client<Transport, chain>,
  { name, data, strict, gatewayUrls }: ResolveNameDataParameters<data>,
): Promise<ResolveNameDataReturnType<data>> {
  const nameWithSizedLabels = getNameWithSizedLabels(name)
  const readContractAction = getAction(client, readContract, 'readContract')

  const baseParameters = {
    address: getChainContractAddress({
      client,
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
