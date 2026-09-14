import {
  permissionedResolverRevokeRolesSnippet,
  permissionedResolverRevokeRootRolesSnippet,
} from '@ensdomains/ensjs-abi/v2/permissionedResolver'
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
import type {
  Prettify,
  WriteTransactionParameters,
} from '../../../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../../types/internal.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../../../utils/clientWithOverrides.js'
import {
  computeResolverResource,
  type ResolverSetterScope,
  resolverSetterScopeRole,
} from '../../../../utils/v2/roles/resolverResource.js'
import {
  encodeResolverRoleBitmap,
  type ResolverRole,
} from '../../../../utils/v2/roles/resolverRoles.js'

// ─── Parameter types ─────────────────────────────────────────────────

type BaseParameters = {
  /** The resolver address */
  resolverAddress: Address
  /** The account to revoke roles from */
  targetAccount: Address
}

export type RevokeResolverRolesRootParameters = BaseParameters & {
  /** Revoke roles held on the root resource */
  scope: 'root'
  /** The resolver roles to revoke */
  roles: ResolverRole[]
}

export type RevokeResolverRolesSetterParameters = BaseParameters & {
  /** Revoke the setter's role for a single argument */
  scope: 'setter'
  /** The setter argument the role was scoped to */
  setter: ResolverSetterScope
}

export type RevokeResolverRolesResourceParameters = BaseParameters & {
  /** Revoke roles on a raw EAC resource (for resources read from events) */
  scope: 'resource'
  /** The EAC resource the roles are held on */
  resource: bigint
  /** The resolver roles to revoke */
  roles: ResolverRole[]
}

export type RevokeResolverRolesBaseParameters =
  | RevokeResolverRolesRootParameters
  | RevokeResolverRolesSetterParameters
  | RevokeResolverRolesResourceParameters

export type RevokeResolverRolesReturnType = Hash

export type RevokeResolverRolesErrorType =
  | WriteContractErrorType
  | ClientWithOverridesErrorType

// ─── Write parameters ────────────────────────────────────────────────

export const revokeResolverRolesWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  params: RevokeResolverRolesBaseParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const base = {
    address: params.resolverAddress,
    chain: client.chain,
    account: client.account,
  } as const

  switch (params.scope) {
    case 'root':
      return {
        ...base,
        abi: permissionedResolverRevokeRootRolesSnippet,
        functionName: 'revokeRootRoles',
        args: [encodeResolverRoleBitmap(params.roles), params.targetAccount],
      } as const

    case 'setter':
      return {
        ...base,
        abi: permissionedResolverRevokeRolesSnippet,
        functionName: 'revokeRoles',
        args: [
          computeResolverResource(params.setter),
          encodeResolverRoleBitmap([resolverSetterScopeRole(params.setter)]),
          params.targetAccount,
        ],
      } as const

    case 'resource':
      return {
        ...base,
        abi: permissionedResolverRevokeRolesSnippet,
        functionName: 'revokeRoles',
        args: [
          params.resource,
          encodeResolverRoleBitmap(params.roles),
          params.targetAccount,
        ],
      } as const
  }
}

// ─── Action ──────────────────────────────────────────────────────────

export type RevokeResolverRolesParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
> = Prettify<
  RevokeResolverRolesBaseParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

/**
 * Revoke roles on a PermissionedResolver (V2).
 *
 * - **`'root'`**: revoke roles held on the root resource.
 * - **`'setter'`**: revoke the setter's role for one argument (mirror of the
 *   `'setter'` grant); the resource is computed from the argument.
 * - **`'resource'`**: revoke roles on a raw EAC resource, for callers that
 *   read the resource from `EACRolesChanged` events.
 *
 * The caller must hold the admin variant of each role on root or on the
 * resource.
 *
 * @param client - Wallet client
 * @param parameters - {@link RevokeResolverRolesParameters}
 * @returns Transaction hash. {@link RevokeResolverRolesReturnType}
 *
 * @example
 * // Revoke roles globally
 * const hash = await revokeResolverRoles(walletClient, {
 *   resolverAddress: '0x...',
 *   targetAccount: '0xOTHER',
 *   scope: 'root',
 *   roles: ['ROLE_LINK'],
 * })
 *
 * @example
 * // Revoke ROLE_SET_TEXT for the `avatar` key
 * const hash = await revokeResolverRoles(walletClient, {
 *   resolverAddress: '0x...',
 *   targetAccount: '0xOTHER',
 *   scope: 'setter',
 *   setter: { kind: 'text', key: 'avatar' },
 * })
 */
export async function revokeResolverRoles<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  params: RevokeResolverRolesParameters<chain, account, chainOverride>,
): Promise<RevokeResolverRolesReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const { scope, resolverAddress, targetAccount, ...txArgs } = params

  let scopeParams: RevokeResolverRolesBaseParameters
  switch (scope) {
    case 'root':
      scopeParams = {
        scope,
        resolverAddress,
        targetAccount,
        roles: params.roles,
      }
      break
    case 'setter':
      scopeParams = {
        scope,
        resolverAddress,
        targetAccount,
        setter: params.setter,
      }
      break
    case 'resource':
      scopeParams = {
        scope,
        resolverAddress,
        targetAccount,
        resource: params.resource,
        roles: params.roles,
      }
      break
  }

  const writeParameters = revokeResolverRolesWriteParameters(
    clientWithOverrides(client, txArgs),
    scopeParams,
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
