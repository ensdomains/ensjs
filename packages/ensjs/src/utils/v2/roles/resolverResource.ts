import type { Hex } from 'viem'
import { encodePacked, keccak256, toBytes } from 'viem'

/**
 * Compute a PermissionedResolver EAC resource ID from a node and part.
 * Mirrors `PermissionedResolverLib.resource(node, part)` in Solidity:
 * `keccak256(abi.encode(node, part))`
 *
 * @param node - The namehash of the name (bytes32). Use '0x00...00' for "any name".
 * @param part - The record-type part (bytes32). Use '0x00...00' for "any record type".
 * @returns The resource ID as a bigint.
 */
export function computeResolverResource(node: Hex, part: Hex): bigint {
  return BigInt(keccak256(encodePacked(['bytes32', 'bytes32'], [node, part])))
}

/**
 * Compute the record-type identifier for text records, namespaced by key.
 * Mirrors `PermissionedResolverLib.textPart(key)` in Solidity:
 * `keccak256(abi.encodePacked(uint8(2), keccak256(bytes(key))))`
 *
 * @param key - The text record key (e.g. "avatar").
 * @returns The part as a bytes32 hex string.
 */
export function textPart(key: string): Hex {
  const keyHash = keccak256(toBytes(key))
  return keccak256(encodePacked(['uint8', 'bytes32'], [2, keyHash]))
}

/**
 * Compute the record-type identifier for address records, namespaced by coin type.
 * Mirrors `PermissionedResolverLib.addrPart(coinType)` in Solidity:
 * `keccak256(abi.encodePacked(uint8(1), coinType))`
 *
 * @param coinType - The SLIP-44 coin type (e.g. 60n for ETH).
 * @returns The part as a bytes32 hex string.
 */
export function addrPart(coinType: bigint): Hex {
  return keccak256(encodePacked(['uint8', 'uint256'], [1, coinType]))
}
