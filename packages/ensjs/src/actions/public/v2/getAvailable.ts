import { ethRegistrarAvailableSnippet } from '@ensdomains/ensjs-abi/v2/ethRegistrar'
import type {
  Chain,
  GetChainContractAddressErrorType,
  ReadContractErrorType,
} from 'viem'
import { readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import type { RequireClientContracts } from '../../../clients/shared.js'
import { getChainContractAddress } from '../../../clients/shared.js'
import { UnsupportedNameTypeError } from '../../../errors/general.js'
import type { ErrorType } from '../../../errors/utils.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import { getNameType } from '../../../utils/name/getNameType.js'

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
 * import { getAvailable } from '@ensdomains/ensjs/public/v2'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getAvailable(client, { name: 'ens.eth' })
 * // false
 */
export async function getAvailable<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensEthRegistrar'>,
  { name }: GetAvailableParameters,
): Promise<GetAvailableReturnType> {
  const labels = name.split('.')
  const nameType = getNameType(name)
  ASSERT_NO_TYPE_ERROR(client)
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
      contract: 'ensEthRegistrar',
    }),
    abi: ethRegistrarAvailableSnippet,
    functionName: 'isAvailable',
    args: [labels[0]],
  })
  return result
}
