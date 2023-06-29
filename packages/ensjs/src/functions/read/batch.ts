import type { Hex } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { FunctionNotBatchableError } from '../../errors/read'
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
      if (!encodeRef) throw new FunctionNotBatchableError({ functionIndex: i })
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

type BatchableFunctionObject = GeneratedFunction<typeof encode, typeof decode>

/**
 * Batches multiple read functions into a single call.
 * @param client - {@link ClientWithEns}
 * @param ...parameters - Array of {@link BatchFunctionResult} objects
 * @returns Array of return values from each function
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addContracts, batch, getText, getAddressRecord } from '@ensdomains/ensjs'
 *
 * const mainnetWithEns = addContracts([mainnet])
 * const client = createPublicClient({
 *   chain: mainnetWithEns,
 *   transport: http(),
 * })
 * const result = await batch(
 *   client,
 *   getText.batch({ name: 'ens.eth', key: 'com.twitter' }),
 *   getAddressRecord.batch({ name: 'ens.eth', coin: 'ETH' }),
 * )
 * // ['ensdomains', { id: 60, name: 'ETH', value: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7 }]
 */
const batch = generateFunction({
  encode,
  decode,
}) as (<I extends BatchFunctionResult[]>(
  client: ClientWithEns,
  ...args: I
) => Promise<BatchReturnType<I> | undefined>) &
  BatchableFunctionObject

export default batch
