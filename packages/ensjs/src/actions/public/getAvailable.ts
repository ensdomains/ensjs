import type {
  Chain,
  GetChainContractAddressErrorType,
  ReadContractErrorType,
} from 'viem'
import { readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import {
  getChainContractAddress,
  type RequireClientContracts,
} from '../../clients/chain.js'
import { l2EthRegistrarAvailableSnippet } from '../../contracts/l2EthRegistrar.js'
import { UnsupportedNameTypeError } from '../../errors/general.js'
import type { ErrorType } from '../../errors/utils.js'
import type { ExcludeTE } from '../../types/internal.js'
import { getNameType } from '../../utils/name/getNameType.js'

export type GetAvailableParameters = {
  /** Name to check availability for, only compatible for eth 2ld */
  name: string
}

export type GetAvailableReturnType = boolean

export type GetAvailableErrorType =
  | UnsupportedNameTypeError
  | ReadContractErrorType
  | GetChainContractAddressErrorType
  | ErrorType

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
export async function getAvailable<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensL2EthRegistrar'>,
  { name }: GetAvailableParameters,
): Promise<GetAvailableReturnType> {
  client = client as ExcludeTE<typeof client>

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
      chain: client.chain,
      contract: 'ensL2EthRegistrar',
    }),
    abi: l2EthRegistrarAvailableSnippet,
    functionName: 'available',
    args: [labels[0]],
  })
  return result
}
