import type {
  Account,
  Address,
  Chain,
  Client,
  Transport,
  WriteContractErrorType,
  WriteContractParameters,
  WriteContractReturnType,
} from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import {
  permissionedResolverGrantAddrRolesSnippet,
  permissionedResolverGrantNameRolesSnippet,
  permissionedResolverGrantRootRolesSnippet,
  permissionedResolverGrantTextRolesSnippet,
} from '../../../contracts/permissionedRegistry.js'
import {
  encodeResolverRoleBitmap,
  type ResolverRole,
} from '../../../utils/v2/roles/resolverRoles.js'

// ─── DNS encoding helper ─────────────────────────────────────────────

/**
 * DNS-encode a dotted name into wire format (0x-prefixed hex).
 * Empty string encodes to "0x00" (root / any name).
 */
function dnsEncodeName(name: string): `0x${string}` {
  if (name === '') return '0x00'
  const labels = name.split('.')
  const parts: number[] = []
  for (const label of labels) {
    const encoded = new TextEncoder().encode(label)
    parts.push(encoded.length, ...encoded)
  }
  parts.push(0)
  const hex = Array.from(new Uint8Array(parts))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `0x${hex}`
}

// ─── grantResolverRootRoles ──────────────────────────────────────────

export type GrantResolverRootRolesParameters = {
  /** The resolver address */
  resolverAddress: Address
  /** The resolver roles to grant on ROOT_RESOURCE (global) */
  roles: ResolverRole[]
  /** The account to grant roles to */
  account: Address
}

export type GrantResolverRootRolesReturnType = WriteContractReturnType

export type GrantResolverRootRolesErrorType = WriteContractErrorType

/**
 * Grant root-level roles on a PermissionedResolver.
 *
 * Root roles apply globally — they authorize the account for any name
 * and any record type. Use this for root-only roles like ROLE_SET_ALIAS,
 * or to create a global admin.
 *
 * The caller must hold the admin variant of each role being granted
 * (e.g., ROLE_SET_ALIAS_ADMIN to grant ROLE_SET_ALIAS).
 *
 * This calls `grantRootRoles(roleBitmap, account)` on the resolver,
 * which is inherited from EnhancedAccessControl and works directly.
 *
 * @example
 * // Grant ROLE_SET_ALIAS to another address
 * const hash = await grantResolverRootRoles(walletClient, {
 *   resolverAddress: '0x932c8ea8870162b6b4686e86a0df5ab863994627',
 *   roles: ['ROLE_SET_ALIAS'],
 *   account: '0xOTHER_ADDRESS',
 * })
 *
 * @example
 * // Grant multiple roles at once
 * const hash = await grantResolverRootRoles(walletClient, {
 *   resolverAddress: '0x...',
 *   roles: ['ROLE_SET_ADDR', 'ROLE_SET_TEXT', 'ROLE_SET_ALIAS'],
 *   account: '0xOTHER_ADDRESS',
 * })
 */
export async function grantResolverRootRoles<
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  {
    resolverAddress,
    roles,
    account: targetAccount,
  }: GrantResolverRootRolesParameters,
): Promise<GrantResolverRootRolesReturnType> {
  const writeContractAction = getAction(client, writeContract, 'writeContract')

  const roleBitmap = encodeResolverRoleBitmap(roles)

  return writeContractAction({
    address: resolverAddress,
    abi: permissionedResolverGrantRootRolesSnippet,
    functionName: 'grantRootRoles',
    args: [roleBitmap, targetAccount],
    chain: client.chain,
    account: client.account,
  } as WriteContractParameters)
}

// ─── grantResolverNameRoles ──────────────────────────────────────────

export type GrantResolverNameRolesParameters = {
  /** The resolver address */
  resolverAddress: Address
  /**
   * The name to grant roles for (dotted format, e.g. "myname.eth").
   * Use "" (empty string) for ROOT_RESOURCE (any name).
   */
  name: string
  /** The resolver roles to grant */
  roles: ResolverRole[]
  /** The account to grant roles to */
  account: Address
}

export type GrantResolverNameRolesReturnType = WriteContractReturnType

export type GrantResolverNameRolesErrorType = WriteContractErrorType

/**
 * Grant resolver roles to an account for a specific name.
 *
 * Use `name: ""` to grant on ROOT_RESOURCE (any name), which is equivalent
 * to `grantRootRoles()`. This is required for root-only roles like ROLE_SET_ALIAS.
 *
 * The caller must have the admin version of the roles being granted.
 *
 * @example
 * // Grant ROLE_SET_ALIAS globally to another address
 * const hash = await grantResolverNameRoles(walletClient, {
 *   resolverAddress: '0x...',
 *   name: '',
 *   roles: ['ROLE_SET_ALIAS'],
 *   account: '0xOTHER_ADDRESS',
 * })
 *
 * @example
 * // Grant ROLE_SET_TEXT for a specific name
 * const hash = await grantResolverNameRoles(walletClient, {
 *   resolverAddress: '0x...',
 *   name: 'myname.eth',
 *   roles: ['ROLE_SET_TEXT'],
 *   account: '0xOTHER_ADDRESS',
 * })
 */
export async function grantResolverNameRoles<
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  {
    resolverAddress,
    name,
    roles,
    account: targetAccount,
  }: GrantResolverNameRolesParameters,
): Promise<GrantResolverNameRolesReturnType> {
  const writeContractAction = getAction(client, writeContract, 'writeContract')

  const roleBitmap = encodeResolverRoleBitmap(roles)
  const dnsName = dnsEncodeName(name)

  return writeContractAction({
    address: resolverAddress,
    abi: permissionedResolverGrantNameRolesSnippet,
    functionName: 'grantNameRoles',
    args: [dnsName, roleBitmap, targetAccount],
    chain: client.chain,
    account: client.account,
  } as WriteContractParameters)
}

// ─── grantResolverTextRoles ──────────────────────────────────────────

export type GrantResolverTextRolesParameters = {
  /** The resolver address */
  resolverAddress: Address
  /**
   * The name to grant text roles for (dotted format).
   * Use "" for ROOT_RESOURCE (any name).
   */
  name: string
  /** The specific text key to grant ROLE_SET_TEXT for */
  key: string
  /** The account to grant roles to */
  account: Address
}

export type GrantResolverTextRolesReturnType = WriteContractReturnType

export type GrantResolverTextRolesErrorType = WriteContractErrorType

/**
 * Grant ROLE_SET_TEXT to an account for a specific text key on a name.
 *
 * This is more fine-grained than `grantResolverNameRoles` with ROLE_SET_TEXT —
 * it restricts the grant to a single text key (e.g., only "avatar").
 *
 * The caller must have ROLE_SET_TEXT admin on the name's resource.
 *
 * @example
 * // Let someone only edit the "avatar" text record for myname.eth
 * const hash = await grantResolverTextRoles(walletClient, {
 *   resolverAddress: '0x...',
 *   name: 'myname.eth',
 *   key: 'avatar',
 *   account: '0xOTHER_ADDRESS',
 * })
 */
export async function grantResolverTextRoles<
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  {
    resolverAddress,
    name,
    key,
    account: targetAccount,
  }: GrantResolverTextRolesParameters,
): Promise<GrantResolverTextRolesReturnType> {
  const writeContractAction = getAction(client, writeContract, 'writeContract')

  const dnsName = dnsEncodeName(name)

  return writeContractAction({
    address: resolverAddress,
    abi: permissionedResolverGrantTextRolesSnippet,
    functionName: 'grantTextRoles',
    args: [dnsName, key, targetAccount],
    chain: client.chain,
    account: client.account,
  } as WriteContractParameters)
}

// ─── grantResolverAddrRoles ──────────────────────────────────────────

export type GrantResolverAddrRolesParameters = {
  /** The resolver address */
  resolverAddress: Address
  /**
   * The name to grant addr roles for (dotted format).
   * Use "" for ROOT_RESOURCE (any name).
   */
  name: string
  /** The specific coin type to grant ROLE_SET_ADDR for (e.g., 60n for ETH) */
  coinType: bigint
  /** The account to grant roles to */
  account: Address
}

export type GrantResolverAddrRolesReturnType = WriteContractReturnType

export type GrantResolverAddrRolesErrorType = WriteContractErrorType

/**
 * Grant ROLE_SET_ADDR to an account for a specific coin type on a name.
 *
 * This is more fine-grained than `grantResolverNameRoles` with ROLE_SET_ADDR —
 * it restricts the grant to a single coin type (e.g., only ETH addresses).
 *
 * The caller must have ROLE_SET_ADDR admin on the name's resource.
 *
 * @example
 * // Let someone only edit the ETH address record for myname.eth
 * const hash = await grantResolverAddrRoles(walletClient, {
 *   resolverAddress: '0x...',
 *   name: 'myname.eth',
 *   coinType: 60n,
 *   account: '0xOTHER_ADDRESS',
 * })
 */
export async function grantResolverAddrRoles<
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  {
    resolverAddress,
    name,
    coinType,
    account: targetAccount,
  }: GrantResolverAddrRolesParameters,
): Promise<GrantResolverAddrRolesReturnType> {
  const writeContractAction = getAction(client, writeContract, 'writeContract')

  const dnsName = dnsEncodeName(name)

  return writeContractAction({
    address: resolverAddress,
    abi: permissionedResolverGrantAddrRolesSnippet,
    functionName: 'grantAddrRoles',
    args: [dnsName, coinType, targetAccount],
    chain: client.chain,
    account: client.account,
  } as WriteContractParameters)
}
