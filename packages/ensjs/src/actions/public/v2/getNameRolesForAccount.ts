import type { Client } from 'viem'
import type { Address } from 'viem/accounts'
import { type ReadContractErrorType, readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { permissionedRegistryRolesSnippet } from '../../../contracts/permissionedRegistry.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import { decodeRoleCounts, registryRoles } from '../../../utils/v2/index.js'
import { labelToCanonicalId } from '../../../utils/v2/registry/labelToCanonicalId.js'

export type GetNameRolesForAccountParameters = {
  registryAddress: Address
  account: Address
  label: string
}

export type GetNameRolesForAccountReturnType = {
  decoded: Array<keyof typeof registryRoles>
  raw: bigint
}

export type GetNameRolesForAccountErrorType = ReadContractErrorType

/**
 * Gets the registry's roles for an account.
 * @param client - {@link Client}
 * @param parameters - {@link GetRolesForAccountParameters}
 * @returns Decoded roles bitmap and raw value. {@link GetRolesForAccountReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getRolesForAccount } from '@ensdomains/ensjs/public/v2'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 *
 * const result = await getRolesForAccount(client, {
 *   registryAddress: '0x0f3eb298470639a96bd548cea4a648bc80b2cee2',
 *   account: '0x1234...abcd',
 * })
 */
export async function getNameRolesForAccount(
  client: Client,
  { registryAddress, account, label }: GetNameRolesForAccountParameters,
): Promise<GetNameRolesForAccountReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')

  const roleBitmap = await readContractAction({
    address: registryAddress,
    abi: permissionedRegistryRolesSnippet,
    functionName: 'roles',
    args: [labelToCanonicalId(label), account],
  })

  const roleCounts = decodeRoleCounts(roleBitmap, registryRoles)

  const decoded = (
    Object.keys(roleCounts) as Array<keyof typeof roleCounts>
  ).filter((key) => roleCounts[key] !== 0)

  return {
    decoded,
    raw: roleBitmap,
  }
}
