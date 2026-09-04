import {
  permissionedResolverGrantRootRolesSnippet,
  permissionedResolverGrantSetterRolesSnippet,
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
  encodeResolverSetterScope,
  type ResolverSetterScope,
} from '../../../../utils/v2/roles/resolverResource.js'
import {
  encodeResolverRoleBitmap,
  type ResolverRole,
} from '../../../../utils/v2/roles/resolverRoles.js'

// ─── Parameter types ─────────────────────────────────────────────────

type BaseParameters = {
  /** The resolver address */
  resolverAddress: Address
  /** The account to grant roles to */
  targetAccount: Address
}

export type GrantResolverRolesRootParameters = BaseParameters & {
  /** Grant roles on the root resource: every name, every record of that type */
  scope: 'root'
  /** The resolver roles to grant */
  roles: ResolverRole[]
}

export type GrantResolverRolesSetterParameters = BaseParameters & {
  /**
   * Grant one setter's role for a single argument (a coin type, a text key,
   * ...) across every name on the resolver. The role is implied by the setter.
   */
  scope: 'setter'
  /** The setter argument to scope the role to */
  setter: ResolverSetterScope
}

export type GrantResolverRolesBaseParameters =
  | GrantResolverRolesRootParameters
  | GrantResolverRolesSetterParameters

export type GrantResolverRolesReturnType = Hash

export type GrantResolverRolesErrorType =
  | WriteContractErrorType
  | ClientWithOverridesErrorType

// ─── Write parameters ────────────────────────────────────────────────

export const grantResolverRolesWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  params: GrantResolverRolesBaseParameters,
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
        abi: permissionedResolverGrantRootRolesSnippet,
        functionName: 'grantRootRoles',
        args: [encodeResolverRoleBitmap(params.roles), params.targetAccount],
      } as const

    case 'setter':
      return {
        ...base,
        abi: permissionedResolverGrantSetterRolesSnippet,
        functionName: 'grantSetterRoles',
        args: [encodeResolverSetterScope(params.setter), params.targetAccount],
      } as const
  }
}

// ─── Action ──────────────────────────────────────────────────────────

export type GrantResolverRolesParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
> = Prettify<
  GrantResolverRolesBaseParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

/**
 * Grant roles on a PermissionedResolver (V2).
 *
 * Roles are never scoped to a name; a resolver is already per account. The
 * `scope` parameter picks between:
 *
 * - **`'root'`**: grant roles on the root resource, covering every name and
 *   every record of those types. The caller must hold the admin variant of
 *   each role on root.
 *
 * - **`'setter'`**: grant one setter's role for a single argument (`setAddress`
 *   for one coin type, `setText` for one text key, `setData`, `setABI`,
 *   `setInterface`) across every name. The caller must hold that role's admin
 *   variant on root or on the argument's resource.
 *
 * @param client - Wallet client
 * @param parameters - {@link GrantResolverRolesParameters}
 * @returns Transaction hash. {@link GrantResolverRolesReturnType}
 *
 * @example
 * // Grant roles globally
 * const hash = await grantResolverRoles(walletClient, {
 *   resolverAddress: '0x...',
 *   targetAccount: '0xOTHER',
 *   scope: 'root',
 *   roles: ['ROLE_SET_TEXT', 'ROLE_SET_ADDRESS'],
 * })
 *
 * @example
 * // Grant ROLE_SET_TEXT for the `avatar` key only
 * const hash = await grantResolverRoles(walletClient, {
 *   resolverAddress: '0x...',
 *   targetAccount: '0xOTHER',
 *   scope: 'setter',
 *   setter: { kind: 'text', key: 'avatar' },
 * })
 *
 * @example
 * // Grant ROLE_SET_ADDRESS for coin type 60 only
 * const hash = await grantResolverRoles(walletClient, {
 *   resolverAddress: '0x...',
 *   targetAccount: '0xOTHER',
 *   scope: 'setter',
 *   setter: { kind: 'address', coinType: 60n },
 * })
 */
export async function grantResolverRoles<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  params: GrantResolverRolesParameters<chain, account, chainOverride>,
): Promise<GrantResolverRolesReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const { scope, resolverAddress, targetAccount, ...txArgs } = params

  const scopeParams: GrantResolverRolesBaseParameters =
    scope === 'root'
      ? { scope, resolverAddress, targetAccount, roles: params.roles }
      : { scope, resolverAddress, targetAccount, setter: params.setter }

  const writeParameters = grantResolverRolesWriteParameters(
    clientWithOverrides(client, txArgs),
    scopeParams,
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
