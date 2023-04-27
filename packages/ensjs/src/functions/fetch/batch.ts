import type { Hex } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import {
  TransactionRequest,
  TransactionRequestWithPassthrough,
} from '../../types'
import {
  BatchFunctionResult,
  RawFunction,
  generateFunction,
} from '../../utils/generateFunction'
import multicallWrapper from './multicallWrapper'

const encode = async <TFunction extends RawFunction>(
  client: ClientWithEns,
  ...items: BatchFunctionResult<TFunction>[]
) => {
  const rawDataArr: TransactionRequest[] = await Promise.all(
    items.map(({ args, encode: encodeRef }, i: number) => {
      if (!encodeRef) {
        throw new Error(`Function ${i} is not batchable`)
      }
      return encodeRef(...args)
    }),
  )
  const response = await multicallWrapper.encode(client, rawDataArr)
  return { ...response, passthrough: rawDataArr }
}

const decode = async <I extends BatchFunctionResult<RawFunction>[]>(
  client: ClientWithEns,
  data: Hex,
  passthrough: TransactionRequestWithPassthrough[],
  ...items: I
): Promise<
  | {
      [N in keyof I]: I[N] extends BatchFunctionResult<infer U>
        ? Awaited<ReturnType<U['decode']>>
        : never
    }
  | undefined
> => {
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
  )
}

const batch = generateFunction({ encode, decode })

export default batch
