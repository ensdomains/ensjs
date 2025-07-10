import type { EncodeFunctionDataParameters, Hex } from 'viem'
import { dedicatedResolverSetAbiSnippet } from '../../contracts/dedicatedResolver.js'
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

export const setAbiParameters = async <encodeAs extends AbiEncodeAs>({
  namehash,
  data,
  encodeAs,
}: SetAbiParameters<encodeAs>) => {
  const { contentType, encodedData } = await encodeAbi({
    data,
    encodeAs,
  } as EncodeAbiParameters<encodeAs>)
  
  if (namehash) {
    return {
      abi: publicResolverSetAbiSnippet,
      functionName: 'setABI',
      args: [namehash, BigInt(contentType), encodedData],
    } as const satisfies EncodeFunctionDataParameters<
      typeof publicResolverSetAbiSnippet
    >
  }
  
  return {
    abi: dedicatedResolverSetAbiSnippet,
    functionName: 'setABI',
    args: [BigInt(contentType), encodedData],
  } as const satisfies EncodeFunctionDataParameters<
    typeof dedicatedResolverSetAbiSnippet
  >
}

export type SetAbiParametersReturnType = Awaited<
  ReturnType<typeof setAbiParameters>
>
