import { permissionedRegistryIsEmancipatedSnippet } from '@ensdomains/ensjs-abi/v2/permissionedRegistry'
import type { Address, Client } from 'viem'
import { type ReadContractErrorType, readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { ASSERT_NO_TYPE_ERROR } from '../../../../types/internal.js'

export type GetIsEmancipatedParameters = {
  /** Registry to check */
  registryAddress: Address
}

export type GetIsEmancipatedReturnType = boolean

export type GetIsEmancipatedErrorType = ReadContractErrorType

/**
 * Gets whether no account holds a root role on a V2 registry that can still control its names.
 * `safeTransferFrom` reverts on a registry that isn't emancipated; use `unsafeTransfer` there instead.
 * @param client - {@link Client}
 * @param parameters - {@link GetIsEmancipatedParameters}
 * @returns Whether the registry is emancipated. {@link GetIsEmancipatedReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getIsEmancipated } from '@ensdomains/ensjs/public/v2'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getIsEmancipated(client, { registryAddress: '0xf60aba43E1f7F3DAB1186Ff03B561401C9Df85E2' })
 */
export async function getIsEmancipated(
  client: Client,
  { registryAddress }: GetIsEmancipatedParameters,
): Promise<GetIsEmancipatedReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')

  return readContractAction({
    address: registryAddress,
    abi: permissionedRegistryIsEmancipatedSnippet,
    functionName: 'isEmancipated',
  })
}
