import type {
  Account,
  Address,
  Chain,
  Client,
  Hash,
  Transport,
  WriteContractErrorType,
  WriteContractParameters,
} from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import {
  eacRevokeRolesSnippet,
  eacRevokeRootRolesSnippet,
} from '../../../contracts/enhancedAccessControl.js'
import type {
  Prettify,
  WriteTransactionParameters,
} from '../../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../../utils/clientWithOverrides.js'
import {
  encodeRoleBitmap,
  type Role,
} from '../../../utils/v2/roles/encodeRoleBitmap.js'

// ================================
// Write parameters
// ================================

export type RevokeRolesWriteParametersParameters = {
  /** The registry address */
  registryAddress: Address
  /** The roles to revoke */
  roles: Role[]
  /** The account to revoke roles from */
  account: Address
  /** The resource to revoke roles within (use 0 for ROOT_RESOURCE) */
  resource: bigint
}

export type RevokeRolesWriteParametersReturnType = ReturnType<
  typeof revokeRolesWriteParameters
>

export type RevokeRolesWriteParametersErrorType = Error

export const revokeRolesWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  {
    registryAddress,
    roles,
    account: accountToRevoke,
    resource,
  }: RevokeRolesWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const isRootResource = resource === 0n
  const roleBitmap = encodeRoleBitmap(roles)

  if (isRootResource) {
    return {
      address: registryAddress,
      functionName: 'revokeRootRoles',
      abi: eacRevokeRootRolesSnippet,
      chain: client.chain,
      account: client.account,
      args: [roleBitmap, accountToRevoke] as const,
    } as const satisfies WriteContractParameters<
      typeof eacRevokeRootRolesSnippet
    >
  }

  return {
    address: registryAddress,
    functionName: 'revokeRoles',
    abi: eacRevokeRolesSnippet,
    chain: client.chain,
    account: client.account,
    args: [resource, roleBitmap, accountToRevoke] as const,
  } as const satisfies WriteContractParameters<typeof eacRevokeRolesSnippet>
}

// ================================
// Action
// ================================

export type RevokeRolesParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
> = Prettify<
  RevokeRolesWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type RevokeRolesReturnType = Hash

export type RevokeRolesErrorType =
  | RevokeRolesWriteParametersErrorType
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Revokes roles from an account in the Enhanced Access Control contract.
 * @param client - {@link Client}
 * @param options - {@link RevokeRolesParameters}
 * @returns Transaction hash. {@link RevokeRolesReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { revokeRoles } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await revokeRoles(wallet, {
 *   registryAddress: '0x...',
 *   roles: ['OWNER'],
 *   account: '0x...',
 *   resource: 1n,
 * })
 * // 0x...
 *
 * @example
 * // Revoke root roles (resource = 0)
 * const hash = await revokeRoles(wallet, {
 *   registryAddress: '0x...',
 *   roles: ['OWNER'],
 *   account: '0x...',
 *   resource: 0n,
 * })
 * // 0x...
 */
export async function revokeRoles<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    registryAddress,
    roles,
    account: accountToRevoke,
    resource,
    ...txArgs
  }: RevokeRolesParameters<chain, account, chainOverride>,
): Promise<RevokeRolesReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = revokeRolesWriteParameters(
    clientWithOverrides(client, txArgs),
    {
      registryAddress,
      roles,
      account: accountToRevoke,
      resource,
    },
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
