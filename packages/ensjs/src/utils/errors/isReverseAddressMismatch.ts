import { BaseError, ContractFunctionRevertedError } from 'viem'

/**
 * Checks if the data returned from a universal resolver is safe to use, or if it is a known revert error
 * @returns `true` if the data is safe to use, `false` if it is a known revert error, or throws if it is an unknown error
 */
export const isReverseAddressMismatch = (err: unknown) => {
  if (!(err instanceof BaseError)) return false
  const cause = err.walk((e) => e instanceof ContractFunctionRevertedError)
  if (!(cause instanceof ContractFunctionRevertedError)) return false

  if (cause.data?.errorName === 'ReverseAddressMismatch') return cause.data.args

  return false
}
