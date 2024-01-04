import {
  decodeErrorResult,
  getContractError,
  type BaseError,
  type Hex,
} from 'viem'
import type { Prettify } from '../types.js'
import { getRevertErrorData } from './getRevertErrorData.js'

type CheckSafeUniversalResolverDataParameters = Prettify<
  {
    strict: boolean | undefined
  } & Parameters<typeof getContractError>[1]
>

/**
 * Checks if the data returned from a universal resolver is safe to use, or if it is a known revert error
 * @param parameters - {@link CheckSafeUniversalResolverDataParameters}
 * @returns `true` if the data is safe to use, `false` if it is a known revert error, or throws if it is an unknown error
 */
export const checkSafeUniversalResolverData = (
  data: Hex | BaseError,
  {
    strict,
    abi,
    args,
    functionName,
    address,
    docsPath,
    sender,
  }: CheckSafeUniversalResolverDataParameters,
): data is Hex => {
  if (typeof data === 'object') {
    // if not strict, attempt to check if the error is a known revert error before throwing
    // if it is a known revert error, return false instead of throwing
    // even if strict is false, we want to throw unknown contract errors
    if (!strict) {
      const errorData = getRevertErrorData(data)
      if (errorData) {
        try {
          decodeErrorResult({
            abi,
            data: errorData,
          })
          return false
        } catch (error) {}
      }
    }
    throw getContractError(data, {
      abi,
      args,
      functionName,
      address,
      docsPath,
      sender,
    }) as BaseError
  }
  return true
}
