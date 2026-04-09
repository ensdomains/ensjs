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
import { namehash } from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import {
  permissionedResolverRevokeRolesSnippet,
  permissionedResolverRevokeRootRolesSnippet,
} from '@ensdomains/ensjs-abi/v2/permissionedResolver'
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
  addrPart,
  computeResolverResource,
  textPart,
} from '../../../utils/v2/roles/resolverResource.js'
import {
  encodeResolverRoleBitmap,
  RESOLVER_ROLE_SET_ADDR,
  RESOLVER_ROLE_SET_TEXT,
  type ResolverRole,
} from '../../../utils/v2/roles/resolverRoles.js'

// ─── Parameter types ─────────────────────────────────────────────────

const ZERO_BYTES32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as const

type BaseParameters = {
  /** The resolver address */
  resolverAddress: Address
  /** The account to revoke roles from */
  targetAccount: Address
}

export type RevokeResolverRolesRootParameters = BaseParameters & {
  /** Revoke roles globally (any name, any record type) */
  scope: 'root'
  /** The resolver roles to revoke */
  roles: ResolverRole[]
}

export type RevokeResolverRolesNameParameters = BaseParameters & {
  /** Revoke roles scoped to a specific name */
  scope: 'name'
  /** The name to revoke roles for (dotted format, e.g. "myname.eth") */
  name: string
  /** The resolver roles to revoke */
  roles: ResolverRole[]
}

export type RevokeResolverRolesTextParameters = BaseParameters & {
  /** Revoke ROLE_SET_TEXT scoped to a specific text key on a name */
  scope: 'text'
  /** The name to revoke roles for (dotted format) */
  name: string
  /** The specific text key to revoke ROLE_SET_TEXT for */
  key: string
}

export type RevokeResolverRolesAddrParameters = BaseParameters & {
  /** Revoke ROLE_SET_ADDR scoped to a specific coin type on a name */
  scope: 'addr'
  /** The name to revoke roles for (dotted format) */
  name: string
  /** The specific coin type to revoke ROLE_SET_ADDR for (e.g., 60n for ETH) */
  coinType: bigint
}

export type RevokeResolverRolesBaseParameters =
  | RevokeResolverRolesRootParameters
  | RevokeResolverRolesNameParameters
  | RevokeResolverRolesTextParameters
  | RevokeResolverRolesAddrParameters

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

    case 'name': {
      const resource = computeResolverResource(
        namehash(params.name),
        ZERO_BYTES32,
      )
      return {
        ...base,
        abi: permissionedResolverRevokeRolesSnippet,
        functionName: 'revokeRoles',
        args: [
          resource,
          encodeResolverRoleBitmap(params.roles),
          params.targetAccount,
        ],
      } as const
    }

    case 'text': {
      const resource = computeResolverResource(
        namehash(params.name),
        textPart(params.key),
      )
      return {
        ...base,
        abi: permissionedResolverRevokeRolesSnippet,
        functionName: 'revokeRoles',
        args: [resource, RESOLVER_ROLE_SET_TEXT, params.targetAccount],
      } as const
    }

    case 'addr': {
      const resource = computeResolverResource(
        namehash(params.name),
        addrPart(params.coinType),
      )
      return {
        ...base,
        abi: permissionedResolverRevokeRolesSnippet,
        functionName: 'revokeRoles',
        args: [resource, RESOLVER_ROLE_SET_ADDR, params.targetAccount],
      } as const
    }
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
 * Revoke roles on a PermissionedResolver.
 *
 * The `scope` parameter determines the granularity of the revocation:
 *
 * - **`'root'`**: Revoke roles globally (any name, any record type).
 *   The caller must hold the admin variant of each role.
 *
 * - **`'name'`**: Revoke roles scoped to a specific name.
 *   Computes the resource ID internally from the name.
 *
 * - **`'text'`**: Revoke `ROLE_SET_TEXT` for a specific text key on a name.
 *   Computes the resource ID internally from the name and key.
 *
 * - **`'addr'`**: Revoke `ROLE_SET_ADDR` for a specific coin type on a name.
 *   Computes the resource ID internally from the name and coin type.
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
 *   roles: ['ROLE_SET_ALIAS'],
 * })
 *
 * @example
 * // Revoke roles scoped to a specific name
 * const hash = await revokeResolverRoles(walletClient, {
 *   resolverAddress: '0x...',
 *   targetAccount: '0xOTHER',
 *   scope: 'name',
 *   name: 'myname.eth',
 *   roles: ['ROLE_SET_TEXT'],
 * })
 *
 * @example
 * // Revoke ROLE_SET_TEXT for a specific text key
 * const hash = await revokeResolverRoles(walletClient, {
 *   resolverAddress: '0x...',
 *   targetAccount: '0xOTHER',
 *   scope: 'text',
 *   name: 'myname.eth',
 *   key: 'avatar',
 * })
 *
 * @example
 * // Revoke ROLE_SET_ADDR for a specific coin type
 * const hash = await revokeResolverRoles(walletClient, {
 *   resolverAddress: '0x...',
 *   targetAccount: '0xOTHER',
 *   scope: 'addr',
 *   name: 'myname.eth',
 *   coinType: 60n,
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
        scope: 'root' as const,
        resolverAddress,
        targetAccount,
        roles: params.roles,
      }
      break
    case 'name':
      scopeParams = {
        scope: 'name' as const,
        resolverAddress,
        targetAccount,
        name: params.name,
        roles: params.roles,
      }
      break
    case 'text':
      scopeParams = {
        scope: 'text' as const,
        resolverAddress,
        targetAccount,
        name: params.name,
        key: params.key,
      }
      break
    case 'addr':
      scopeParams = {
        scope: 'addr' as const,
        resolverAddress,
        targetAccount,
        name: params.name,
        coinType: params.coinType,
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
