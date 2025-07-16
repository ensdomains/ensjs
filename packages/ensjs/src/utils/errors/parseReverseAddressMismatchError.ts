import { BaseError, ContractFunctionRevertedError } from 'viem'

/**
 * Determines whether the error is a `ReverseAddressMismatch` and returns its arguments if so.
 */
export const parseReverseAddressMismatchError = (err: unknown) => {
  if (!(err instanceof BaseError)) return false
  const cause = err.walk((e) => e instanceof ContractFunctionRevertedError)
  if (!(cause instanceof ContractFunctionRevertedError)) return false

  if (cause.data?.errorName === 'ReverseAddressMismatch') return cause.data.args

  return false
}
