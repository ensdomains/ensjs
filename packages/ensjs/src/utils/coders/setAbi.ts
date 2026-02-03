import type { EncodeFunctionDataParameters, Hex } from 'viem'
import { publicResolverSetAbiSnippet } from '../../contracts/publicResolver.js'
import type { Prettify } from '../../types/index.js'
import {
  type AbiEncodeAs,
  type EncodeAbiErrorType,
  type EncodeAbiParameters,
  encodeAbi,
} from './encodeAbi.js'

// ================================
// Set ABI parameters
// ================================

export type SetAbiParameters<encodeAs extends AbiEncodeAs = AbiEncodeAs> =
  Prettify<
    {
      namehash?: Hex
    } & EncodeAbiParameters<encodeAs>
  >

export type SetAbiParametersErrorType = EncodeAbiErrorType

/**
 * Sets ABI parameters for encoding.
 * Note: setABI is only supported on Public Resolver, so namehash is required.
 * If namehash is not provided, this function returns undefined.
 */
export const setAbiParameters = async <encodeAs extends AbiEncodeAs>({
  namehash,
  data,
  encodeAs,
}: SetAbiParameters<encodeAs>) => {
  // setABI is only supported on Public Resolver (not Dedicated Resolver)
  if (!namehash) return undefined

  const { contentType, encodedData } = await encodeAbi({
    data,
    encodeAs,
  } as EncodeAbiParameters<encodeAs>)
  return {
    abi: publicResolverSetAbiSnippet,
    functionName: 'setABI',
    args: [namehash, BigInt(contentType), encodedData],
  } as const satisfies EncodeFunctionDataParameters<
    typeof publicResolverSetAbiSnippet
  >
}

export type SetAbiParametersReturnType = Awaited<
  ReturnType<typeof setAbiParameters>
>
