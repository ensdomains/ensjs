/**
 * Generates a fresh, cryptographically random salt for CREATE2 proxy
 * deployment via {@link VerifiableFactory}.
 *
 * Must be called fresh on every deployment attempt (as a function default,
 * never as a module-level constant) - the factory reverts on a repeated
 * `(msg.sender, salt)` pair, so reusing a value across calls in the same
 * process makes every deploy after the first one fail.
 */
export const generateDefaultSalt = (): bigint => {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  let salt = 0n
  for (const byte of bytes) {
    salt = (salt << 8n) | BigInt(byte)
  }
  return salt
}
