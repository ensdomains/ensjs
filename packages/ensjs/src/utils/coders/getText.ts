import { decodeFunctionResult, type Hex } from 'viem'
import { publicResolverTextSnippet } from '../../contracts/publicResolver.js'
import { namehash } from '../name/normalise.js'

export type GetTextParameters = {
  /** Name to get text record for */
  name: string
  /** Text record key to get */
  key: string
  /** Whether or not to throw decoding errors */
  strict?: boolean
}

export type GetTextReturnType = string | null

export type GetTextErrorType = Error

export function getTextParameters({
  name,
  key,
}: Omit<GetTextParameters, 'strict'>) {
  return {
    abi: publicResolverTextSnippet,
    functionName: 'text',
    args: [namehash(name), key],
  } as const
}

export function decodeTextResultFromPrimitiveTypes({
  decodedData,
}: {
  decodedData: string
}): GetTextReturnType {
  if (decodedData === '') return null
  return decodedData
}

export function decodeTextResult(
  data: Hex,
  { strict }: Pick<GetTextParameters, 'strict'>,
): GetTextReturnType {
  if (data === '0x') return null

  try {
    const decodedData = decodeFunctionResult({
      abi: publicResolverTextSnippet,
      functionName: 'text',
      data,
    })

    return decodeTextResultFromPrimitiveTypes({ decodedData })
  } catch (error) {
    if (strict) throw error
    return null
  }
}
