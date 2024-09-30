import { labelhash, type Client, type Transport } from 'viem'
import { readContract } from 'viem/actions'
import { getAction } from 'viem/utils'

import { baseRegistrarAvailableSnippet } from '../../contracts/baseRegistrar.js'
import type { ChainWithContract } from '../../contracts/consts.js'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import { UnsupportedNameTypeError } from '../../errors/general.js'
import { getNameType } from '../../utils/getNameType.js'

export type GetAvailableParameters = {
  /** Name to check availability for, only compatible for eth 2ld */
  name: string
}

export type GetAvailableReturnType = boolean

export type GetAvailableErrorType = UnsupportedNameTypeError | Error

/**
 * Gets the availability of a name to register
 * @param client - {@link Client}
 * @param parameters - {@link GetAvailableParameters}
 * @returns Availability as boolean. {@link GetAvailableReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getAvailable } from '@ensdomains/ensjs/public'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getAvailable(client, { name: 'ens.eth' })
 * // false
 */
export async function getAvailable<
  chain extends ChainWithContract<'ensBaseRegistrarImplementation'>,
>(
  client: Client<Transport, chain>,
  { name }: GetAvailableParameters,
): Promise<GetAvailableReturnType> {
  const labels = name.split('.')
  const nameType = getNameType(name)
  if (nameType !== 'eth-2ld')
    throw new UnsupportedNameTypeError({
      nameType,
      supportedNameTypes: ['eth-2ld'],
      details: 'Currently only eth-2ld names can be checked for availability',
    })

  const readContractAction = getAction(client, readContract, 'readContract')
  const result = await readContractAction({
    address: getChainContractAddress({
      client,
      contract: 'ensBaseRegistrarImplementation',
    }),
    abi: baseRegistrarAvailableSnippet,
    functionName: 'available',
    args: [BigInt(labelhash(labels[0]))],
  })
  return result
}
