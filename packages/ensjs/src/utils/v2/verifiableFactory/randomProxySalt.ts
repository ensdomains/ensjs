import { bytesToBigInt } from 'viem'

/**
 * Draws a fresh 256-bit salt for `VerifiableFactory.deployProxy`.
 *
 * The factory derives the proxy address from `keccak256(abi.encode(msg.sender, salt))`,
 * so an account that reuses a salt targets an address it already occupies and
 * the deploy reverts. Call this per deploy — never hoist it into a module-level
 * constant, which would hand every deploy in a session the same salt.
 *
 * @returns A uniformly random `uint256`
 */
export const randomProxySalt = (): bigint =>
  bytesToBigInt(crypto.getRandomValues(new Uint8Array(32)))
