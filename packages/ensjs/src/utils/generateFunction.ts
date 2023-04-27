import { ClientWithEns } from '../contracts/addContracts'
import { TransactionRequestWithPassthrough } from '../types'

type EncoderFunction = (
  ...args: any[]
) => Promise<TransactionRequestWithPassthrough>
type DecoderFunction = (...args: any[]) => Promise<any>

type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R
  ? (...args: P) => R
  : never

export type RawFunction = {
  encode: EncoderFunction
  decode: DecoderFunction
}

export type BatchFunctionResult<TFunction extends RawFunction> = {
  args: Parameters<TFunction['encode']>
  encode: TFunction['encode']
  decode: TFunction['decode']
}

type BatchFunction<TFunction extends RawFunction> = (
  ...args: Parameters<TFunction['encode']>
) => BatchFunctionResult<TFunction>

export interface GeneratedBatchFunction<TFunction extends RawFunction>
  extends Function,
    RawFunction {
  <I extends BatchFunctionResult<RawFunction>[]>(
    client: ClientWithEns,
    ...args: I
  ): Promise<
    | {
        [N in keyof I]: I[N] extends BatchFunctionResult<infer U>
          ? Awaited<ReturnType<U['decode']>>
          : never
      }
    | undefined
  >
  batch: BatchFunction<TFunction>
}

export type FunctionSubtype =
  | 'raw'
  | 'decode'
  | 'combine'
  | 'batch'
  | 'write'
  | 'populateTransaction'

export const generateFunction = <
  TEncoderFn extends EncoderFunction,
  TDecoderFn extends DecoderFunction,
>({
  encode,
  decode,
}: {
  encode: TEncoderFn
  decode: TDecoderFn
}) => {
  const single = async function (
    client: ClientWithEns,
    ...args: Parameters<OmitFirstArg<TEncoderFn>>
  ): Promise<ReturnType<TDecoderFn> | null> {
    const { passthrough, ...encodedData } = await encode(client, ...args)
    const { data: result } = await client.call(encodedData)
    if (!result) return null
    if (passthrough) return decode(client, result, passthrough, ...args)
    return decode(client, result, ...args)
  }
  single.batch = (...args: Parameters<OmitFirstArg<TEncoderFn>>) => ({
    args,
    encode,
    decode,
  })
  single.encode = encode
  single.decode = decode
  return single
}
