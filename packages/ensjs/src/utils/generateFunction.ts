import { BaseError } from 'viem'
import { call } from 'viem/actions'
import type { ClientWithEns } from '../contracts/consts.js'
import type { TransactionRequestWithPassthrough } from '../types.js'

export type EncoderFunction = (
  // biome-ignore lint/suspicious/noExplicitAny: generic encoder function accepts various argument types
  ...args: any[]
) => TransactionRequestWithPassthrough
// biome-ignore lint/suspicious/noExplicitAny: generic decoder function accepts various argument types and returns various types
export type DecoderFunction = (...args: any[]) => Promise<any>

// biome-ignore lint/suspicious/noExplicitAny: conditional type matches first argument of any type for extraction
type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R
  ? (...args: P) => R
  : never

export type CoderObject<
  TEncoderFn extends EncoderFunction = EncoderFunction,
  TDecoderFn extends DecoderFunction = DecoderFunction,
> = {
  encode: TEncoderFn
  decode: TDecoderFn
}

export type BatchFunctionResult<
  TEncoderFn extends EncoderFunction = EncoderFunction,
  TDecoderFn extends DecoderFunction = DecoderFunction,
> = {
  args: Parameters<OmitFirstArg<TEncoderFn>>
} & CoderObject<TEncoderFn, TDecoderFn>

// biome-ignore lint/complexity/noBannedTypes: Function constraint required for generic type matching any function signature
export type ExtractResult<TFunction extends Function> = TFunction extends (
  // biome-ignore lint/suspicious/noExplicitAny: conditional type matches promise-returning function with any arguments for result extraction
  ...args: any[]
) => Promise<infer U>
  ? U
  : never

export interface GeneratedFunction<
  TEncoderFn extends EncoderFunction,
  TDecoderFn extends DecoderFunction,
  // biome-ignore lint/complexity/noBannedTypes: Function type required for extending base function interface with additional properties
> extends Function,
    CoderObject<TEncoderFn, TDecoderFn> {
  (
    client: ClientWithEns,
    ...args: Parameters<OmitFirstArg<TEncoderFn>>
  ): Promise<ExtractResult<TDecoderFn> | null>
  batch: (
    ...args: Parameters<OmitFirstArg<TEncoderFn>>
  ) => BatchFunctionResult<TEncoderFn, TDecoderFn>
}

export const generateFunction = <
  TEncoderFn extends EncoderFunction,
  TDecoderFn extends DecoderFunction,
  TFunction extends GeneratedFunction<
    TEncoderFn,
    TDecoderFn
  > = GeneratedFunction<TEncoderFn, TDecoderFn>,
>({
  encode,
  decode,
}: {
  encode: TEncoderFn
  decode: TDecoderFn
}) => {
  const single = (async (client, ...args) => {
    const { passthrough, ...encodedData } = encode(client, ...args)
    const result = await call(client, encodedData)
      .then((ret) => ret.data)
      .catch((e) => {
        if (!(e instanceof BaseError)) throw e
        return e
      })
    if (passthrough) return decode(client, result, passthrough, ...args)
    return decode(client, result, ...args)
  }) as TFunction
  single.batch = (...args) => ({
    args,
    encode,
    decode,
  })
  single.encode = encode
  single.decode = decode
  return single
}
