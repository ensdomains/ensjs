import { BaseError, ContractFunctionRevertedError } from 'viem'

const OFFCHAIN_LOOKUP_SELECTOR = '0x556f1830'

/**
 * Checks if a contract call reverted with EIP-3668 `OffchainLookup`, i.e. it
 * needs CCIP-Read but was made without it
 */
export const isOffchainLookupError = (err: unknown) => {
  if (!(err instanceof BaseError)) return false
  const cause = err.walk((e) => e instanceof ContractFunctionRevertedError)
  if (!(cause instanceof ContractFunctionRevertedError)) return false
  return (
    cause.raw?.slice(0, 10) === OFFCHAIN_LOOKUP_SELECTOR ||
    cause.signature === OFFCHAIN_LOOKUP_SELECTOR
  )
}
