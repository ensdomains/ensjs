import {
  permissionedResolverAuthorizeAddrRolesSnippet,
  permissionedResolverAuthorizeNameRolesSnippet,
  permissionedResolverAuthorizeTextRolesSnippet,
  permissionedResolverGrantRootRolesSnippet,
} from '@ensdomains/ensjs-abi/v2/permissionedResolver'
import type {
  Account,
  Address,
  Chain,
  Client,
  Hash,
  Hex,
  Transport,
  WriteContractErrorType,
  WriteContractParameters,
} from 'viem'
import { toHex } from 'viem'
import { writeContract } from 'viem/actions'
import { packetToBytes } from 'viem/ens'
import { getAction } from 'viem/utils'
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
  encodeResolverRoleBitmap,
  type ResolverRole,
} from '../../../utils/v2/roles/resolverRoles.js'

// ─── Parameter types ─────────────────────────────────────────────────

type BaseParameters = {
  /** The resolver address */
  resolverAddress: Address
  /** The account to grant roles to */
  targetAccount: Address
}

export type GrantResolverRolesRootParameters = BaseParameters & {
  /** Grant roles globally (any name, any record type) */
  scope: 'root'
  /** The resolver roles to grant */
  roles: ResolverRole[]
}

export type GrantResolverRolesNameParameters = BaseParameters & {
  /**
   * Grant roles scoped to a specific name.
   * Use `name: ""` for any name (equivalent to root).
   */
  scope: 'name'
  /** The name to grant roles for (dotted format, e.g. "myname.eth") */
  name: string
  /** The resolver roles to grant */
  roles: ResolverRole[]
}

export type GrantResolverRolesTextParameters = BaseParameters & {
  /** Grant ROLE_SET_TEXT scoped to a specific text key on a name */
  scope: 'text'
  /** The name to grant roles for (dotted format, use "" for any name) */
  name: string
  /** The specific text key to grant ROLE_SET_TEXT for */
  key: string
}

export type GrantResolverRolesAddrParameters = BaseParameters & {
  /** Grant ROLE_SET_ADDR scoped to a specific coin type on a name */
  scope: 'addr'
  /** The name to grant roles for (dotted format, use "" for any name) */
  name: string
  /** The specific coin type to grant ROLE_SET_ADDR for (e.g., 60n for ETH) */
  coinType: bigint
}

export type GrantResolverRolesBaseParameters =
  | GrantResolverRolesRootParameters
  | GrantResolverRolesNameParameters
  | GrantResolverRolesTextParameters
  | GrantResolverRolesAddrParameters

export type GrantResolverRolesReturnType = Hash

export type GrantResolverRolesErrorType =
  | WriteContractErrorType
  | ClientWithOverridesErrorType

// ─── Write parameters ────────────────────────────────────────────────

function dnsEncode(name: string): Hex {
  return toHex(packetToBytes(name))
}

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

    case 'name':
      return {
        ...base,
        abi: permissionedResolverAuthorizeNameRolesSnippet,
        functionName: 'authorizeNameRoles',
        args: [
          dnsEncode(params.name),
          encodeResolverRoleBitmap(params.roles),
          params.targetAccount,
          true,
        ],
      } as const

    case 'text':
      return {
        ...base,
        abi: permissionedResolverAuthorizeTextRolesSnippet,
        functionName: 'authorizeTextRoles',
        args: [dnsEncode(params.name), params.key, params.targetAccount, true],
      } as const

    case 'addr':
      return {
        ...base,
        abi: permissionedResolverAuthorizeAddrRolesSnippet,
        functionName: 'authorizeAddrRoles',
        args: [
          dnsEncode(params.name),
          params.coinType,
          params.targetAccount,
          true,
        ],
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
 * Grant roles on a PermissionedResolver.
 *
 * The `scope` parameter determines the granularity of the grant:
 *
 * - **`'root'`**: Grant roles globally (any name, any record type).
 *   The caller must hold the admin variant of each role.
 *
 * - **`'name'`**: Grant roles scoped to a specific name.
 *   Use `name: ""` for any name (equivalent to root scope).
 *
 * - **`'text'`**: Grant `ROLE_SET_TEXT` for a specific text key on a name.
 *   The caller must have `ROLE_SET_TEXT` admin on the name's resource.
 *
 * - **`'addr'`**: Grant `ROLE_SET_ADDR` for a specific coin type on a name.
 *   The caller must have `ROLE_SET_ADDR` admin on the name's resource.
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
 *   roles: ['ROLE_SET_TEXT', 'ROLE_SET_ADDR'],
 * })
 *
 * @example
 * // Grant roles scoped to a specific name
 * const hash = await grantResolverRoles(walletClient, {
 *   resolverAddress: '0x...',
 *   targetAccount: '0xOTHER',
 *   scope: 'name',
 *   name: 'myname.eth',
 *   roles: ['ROLE_SET_TEXT'],
 * })
 *
 * @example
 * // Grant ROLE_SET_TEXT for a specific text key
 * const hash = await grantResolverRoles(walletClient, {
 *   resolverAddress: '0x...',
 *   targetAccount: '0xOTHER',
 *   scope: 'text',
 *   name: 'myname.eth',
 *   key: 'avatar',
 * })
 *
 * @example
 * // Grant ROLE_SET_ADDR for a specific coin type
 * const hash = await grantResolverRoles(walletClient, {
 *   resolverAddress: '0x...',
 *   targetAccount: '0xOTHER',
 *   scope: 'addr',
 *   name: 'myname.eth',
 *   coinType: 60n,
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

  let scopeParams: GrantResolverRolesBaseParameters
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
