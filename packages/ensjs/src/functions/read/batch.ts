import type { Hex } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import {
  SimpleTransactionRequest,
  TransactionRequestWithPassthrough,
} from '../../types'
import {
  BatchFunctionResult,
  GeneratedFunction,
  generateFunction,
} from '../../utils/generateFunction'
import multicallWrapper from './multicallWrapper'

const encode = (
  client: ClientWithEns,
  ...items: BatchFunctionResult[]
): TransactionRequestWithPassthrough => {
  const rawDataArr: SimpleTransactionRequest[] = items.map(
    ({ args, encode: encodeRef }, i: number) => {
      if (!encodeRef) {
        throw new Error(`Function ${i} is not batchable`)
      }
      return encodeRef(client, ...args)
    },
  )
  const response = multicallWrapper.encode(client, {
    transactions: rawDataArr,
  })
  return { ...response, passthrough: rawDataArr }
}

type ExtractResult<TFunction extends BatchFunctionResult> = TFunction extends {
  decode: (...args: any[]) => Promise<infer U>
}
  ? U
  : never

type BatchReturnType<TFunctions extends BatchFunctionResult[]> = {
  [TFunctionName in keyof TFunctions]: ExtractResult<TFunctions[TFunctionName]>
}

const decode = async <I extends BatchFunctionResult[]>(
  client: ClientWithEns,
  data: Hex,
  passthrough: TransactionRequestWithPassthrough[],
  ...items: I
): Promise<BatchReturnType<I> | undefined> => {
  const response = await multicallWrapper.decode(client, data, passthrough)
  if (!response) return

  return Promise.all(
    response.map((ret, i: number) => {
      if (passthrough[i].passthrough) {
        return items[i].decode(
          client,
          ret.returnData,
          passthrough[i].passthrough,
          ...items[i].args,
        )
      }
      return items[i].decode(client, ret.returnData, ...items[i].args)
    }),
  ) as Promise<BatchReturnType<I>>
}

type EncoderFunction = typeof encode
type DecoderFunction = typeof decode

interface GeneratedBatchFunction
  extends GeneratedFunction<EncoderFunction, DecoderFunction> {
  <I extends BatchFunctionResult[]>(client: ClientWithEns, ...args: I): Promise<
    BatchReturnType<I> | undefined
  >
}

const batch = generateFunction<
  EncoderFunction,
  DecoderFunction,
  GeneratedBatchFunction
>({ encode, decode })

export default batch
