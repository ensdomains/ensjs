import { publicResolverSetAbiSnippet } from '@ensdomains/ensjs-abi/v1/publicResolver'
import {
  type EncodeFunctionDataParameters,
  type NamehashErrorType,
  namehash,
} from 'viem'
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
      /** Name to set ABI for (namehash is computed internally) */
      name: string
    } & EncodeAbiParameters<encodeAs>
  >

export type SetAbiParametersErrorType = EncodeAbiErrorType | NamehashErrorType

/**
 * Sets ABI parameters for encoding.
 * Uses Public Resolver ABI `setABI(node, contentType, data)`
 */
export const setAbiParameters = async <encodeAs extends AbiEncodeAs>({
  name,
  data,
  encodeAs,
}: SetAbiParameters<encodeAs>) => {
  const { contentType, encodedData } = await encodeAbi({
    data,
    encodeAs,
  } as EncodeAbiParameters<encodeAs>)

  return {
    abi: publicResolverSetAbiSnippet,
    functionName: 'setABI',
    args: [namehash(name), BigInt(contentType), encodedData],
  } as const satisfies EncodeFunctionDataParameters<
    typeof publicResolverSetAbiSnippet
  >
}

export type SetAbiParametersReturnType = Awaited<
  ReturnType<typeof setAbiParameters>
>
