import { BaseError, ContractFunctionRevertedError } from 'viem'

/**
 * Checks if the error is a known revert error for the registrar ownerOf function
 * @returns `true` if the error is a known revert error, `false` if it is not, or throws if it is an unknown error
 */
export const isNullRegistrarOwnerOfError = (err: unknown) => {
  if (!(err instanceof BaseError)) return false
  const cause = err.walk((e) => e instanceof ContractFunctionRevertedError)
  if (!(cause instanceof ContractFunctionRevertedError)) return false
  return true
}
