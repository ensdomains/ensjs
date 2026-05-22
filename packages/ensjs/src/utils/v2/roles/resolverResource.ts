import type { Hex } from 'viem'
import { encodePacked, keccak256, toBytes } from 'viem'

/**
 * Compute a PermissionedResolver EAC resource ID from a node and part.
 * Mirrors `PermissionedResolverLib.resource(node, part)` in Solidity:
 * - Returns `0` when both `node` and `part` are `bytes32(0)`.
 * - Otherwise returns `keccak256(abi.encode(node, part))` (32-byte node ‖
 *   32-byte part).
 *
 * @param node - The namehash of the name (bytes32). Use '0x00...00' for "any name".
 * @param part - The record-type part (bytes32). Use '0x00...00' for "any record type".
 * @returns The resource ID as a bigint.
 */
export function computeResolverResource(node: Hex, part: Hex): bigint {
  if (/^0x0+$/.test(node) && /^0x0+$/.test(part)) return 0n
  return BigInt(keccak256(encodePacked(['bytes32', 'bytes32'], [node, part])))
}

/**
 * Compute the record-type identifier for text records, namespaced by key.
 * Mirrors `PermissionedResolverLib.partHash(string)` in Solidity:
 * `keccak256(bytes(key))`.
 *
 * @param key - The text record key (e.g. "avatar").
 * @returns The part as a bytes32 hex string.
 */
export function textPart(key: string): Hex {
  return keccak256(toBytes(key))
}

/**
 * Compute the record-type identifier for address records, namespaced by coin type.
 * Mirrors `PermissionedResolverLib.partHash(uint256)` in Solidity:
 * `keccak256(abi.encode(coinType))` — the 32-byte big-endian word.
 *
 * @param coinType - The SLIP-44 coin type (e.g. 60n for ETH).
 * @returns The part as a bytes32 hex string.
 */
export function addrPart(coinType: bigint): Hex {
  return keccak256(encodePacked(['uint256'], [coinType]))
}
