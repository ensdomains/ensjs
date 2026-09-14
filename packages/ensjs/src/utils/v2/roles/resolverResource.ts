import {
  permissionedResolverSetAbiSnippet,
  permissionedResolverSetAddressSnippet,
  permissionedResolverSetDataSnippet,
  permissionedResolverSetInterfaceSnippet,
  permissionedResolverSetTextSnippet,
} from '@ensdomains/ensjs-abi/v2/permissionedResolver'
import type { Hex } from 'viem'
import { encodeFunctionData, keccak256, stringToHex, toHex } from 'viem'
import type { ResolverSetterRole } from './resolverRoles.js'

/** The EAC resource that covers every name on a resolver. */
export const RESOLVER_ROOT_RESOURCE = 0n

/**
 * One setter argument a PermissionedResolver role can be narrowed to. Mirrors
 * the setters `PermissionedResolver.decodeSetter` understands.
 */
export type ResolverSetterScope =
  | { kind: 'address'; coinType: bigint }
  | { kind: 'text'; key: string }
  | { kind: 'data'; key: string }
  | { kind: 'abi'; contentType: bigint }
  | { kind: 'interface'; interfaceId: Hex }

/** The role a setter scope narrows. */
export function resolverSetterScopeRole(
  scope: ResolverSetterScope,
): ResolverSetterRole {
  switch (scope.kind) {
    case 'address':
      return 'ROLE_SET_ADDRESS'
    case 'text':
      return 'ROLE_SET_TEXT'
    case 'data':
      return 'ROLE_SET_DATA'
    case 'abi':
      return 'ROLE_SET_ABI'
    case 'interface':
      return 'ROLE_SET_INTERFACE'
  }
}

/**
 * Compute the EAC resource for a setter argument. Mirrors
 * `PermissionedResolverLib.resource(uint256 | string | bytes4)`:
 * `keccak256(abi.encodePacked(argument))`, i.e. the 32-byte word for a coin
 * type or content type, the raw bytes of a key, the 4 bytes of an interface id.
 *
 * @param scope - The setter argument.
 * @returns The resource ID as a bigint.
 */
export function computeResolverResource(scope: ResolverSetterScope): bigint {
  switch (scope.kind) {
    case 'address':
      return BigInt(keccak256(toHex(scope.coinType, { size: 32 })))
    case 'abi':
      return BigInt(keccak256(toHex(scope.contentType, { size: 32 })))
    case 'text':
    case 'data':
      return BigInt(keccak256(stringToHex(scope.key)))
    case 'interface':
      return BigInt(keccak256(scope.interfaceId))
  }
}

/** The empty DNS-encoded name; `grantSetterRoles` ignores the name anyway. */
const ROOT_DNS_NAME = '0x00' as const

/**
 * Encode the setter calldata `grantSetterRoles(setter, account)` expects: a call
 * to the setter for the scoped argument, with placeholder name and value.
 *
 * @param scope - The setter argument.
 * @returns ABI-encoded setter calldata.
 */
export function encodeResolverSetterScope(scope: ResolverSetterScope): Hex {
  switch (scope.kind) {
    case 'address':
      return encodeFunctionData({
        abi: permissionedResolverSetAddressSnippet,
        functionName: 'setAddress',
        args: [ROOT_DNS_NAME, scope.coinType, '0x'],
      })
    case 'text':
      return encodeFunctionData({
        abi: permissionedResolverSetTextSnippet,
        functionName: 'setText',
        args: [ROOT_DNS_NAME, scope.key, ''],
      })
    case 'data':
      return encodeFunctionData({
        abi: permissionedResolverSetDataSnippet,
        functionName: 'setData',
        args: [ROOT_DNS_NAME, scope.key, '0x'],
      })
    case 'abi':
      return encodeFunctionData({
        abi: permissionedResolverSetAbiSnippet,
        functionName: 'setABI',
        args: [ROOT_DNS_NAME, scope.contentType, '0x'],
      })
    case 'interface':
      return encodeFunctionData({
        abi: permissionedResolverSetInterfaceSnippet,
        functionName: 'setInterface',
        args: [
          ROOT_DNS_NAME,
          scope.interfaceId,
          '0x0000000000000000000000000000000000000000',
        ],
      })
  }
}
