import { BaseError, type Client, type Transport } from 'viem'
import { call } from 'viem/actions'
import type { TransactionRequestWithPassthrough } from '../types.js'

export type EncoderFunction = (
  ...args: any[]
) => TransactionRequestWithPassthrough
export type DecoderFunction = (...args: any[]) => any

type OmitFirstArg<func> = func extends (
  x: any,
  ...args: infer parameters
) => infer returnType
  ? (...args: parameters) => returnType
  : never

type ExtractChainType<func> = func extends (
  client: Client<Transport, infer chainType>,
  ...args: any
) => any
  ? chainType
  : never

export type CoderObject<
  encoderFunction extends EncoderFunction = EncoderFunction,
  decoderFunction extends DecoderFunction = DecoderFunction,
> = {
  encode: encoderFunction
  decode: decoderFunction
}

export type BatchFunctionResult<
  encoderFunction extends EncoderFunction = EncoderFunction,
  decoderFunction extends DecoderFunction = DecoderFunction,
> = {
  args: Parameters<OmitFirstArg<encoderFunction>>
} & CoderObject<encoderFunction, decoderFunction>

export type ExtractResult<func extends Function> = func extends (
  ...args: any[]
) => infer returnType
  ? returnType extends Promise<infer awaited>
    ? awaited
    : returnType
  : never

export interface GeneratedFunction<
  encoderFunction extends EncoderFunction,
  decoderFunction extends DecoderFunction,
> extends Function,
    CoderObject<encoderFunction, decoderFunction> {
  <chain extends ExtractChainType<encoderFunction>>(
    client: Client<Transport, chain>,
    ...args: Parameters<OmitFirstArg<encoderFunction>>
  ): Promise<ExtractResult<decoderFunction> | null>
  batch: (
    ...args: Parameters<OmitFirstArg<encoderFunction>>
  ) => BatchFunctionResult<encoderFunction, decoderFunction>
}

export const generateFunction = <
  encoderFunction extends EncoderFunction,
  decoderFunction extends DecoderFunction,
  generatedFunction extends GeneratedFunction<
    encoderFunction,
    decoderFunction
  > = GeneratedFunction<encoderFunction, decoderFunction>,
>({
  encode,
  decode,
}: {
  encode: encoderFunction
  decode: decoderFunction
}) => {
  const single = async function (client, ...args) {
    const { passthrough, ...encodedData } = encode(client, ...args)
    const result = await call(client, encodedData)
      .then((ret) => ret.data)
      .catch((e) => {
        if (!(e instanceof BaseError)) throw e
        return e
      })
    if (passthrough) return decode(client, result, passthrough, ...args)
    return decode(client, result, ...args)
  } as generatedFunction
  single.batch = (...args) => ({
    args,
    encode,
    decode,
  })
  single.encode = encode
  single.decode = decode
  return single
}
