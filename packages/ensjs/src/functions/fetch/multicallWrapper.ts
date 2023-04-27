import { Hex, decodeFunctionResult, encodeFunctionData } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { tryAggregateSnippet } from '../../contracts/multicall'
import {
  TransactionRequest,
  TransactionRequestWithPassthrough,
} from '../../types'
import ccipLookup from '../../utils/ccip'
import { generateFunction } from '../../utils/generateFunction'

const encode = async (
  client: ClientWithEns,
  transactions: TransactionRequest[],
  requireSuccess: boolean = false,
) => {
  return {
    to: client.chain.contracts.multicall3!.address,
    data: encodeFunctionData({
      abi: tryAggregateSnippet,
      functionName: 'tryAggregate',
      args: [
        requireSuccess,
        transactions.map((tx) => ({ target: tx.to!, callData: tx.data! })),
      ],
    }),
  }
}

const decode = async (
  client: ClientWithEns,
  data: Hex,
  transactions: TransactionRequestWithPassthrough[],
) => {
  const result = decodeFunctionResult({
    abi: tryAggregateSnippet,
    functionName: 'tryAggregate',
    data,
  })
  const ccipChecked = await Promise.all(
    result.map(async ({ success, returnData }, i) => {
      let newObj: { success: boolean; returnData: Hex } = {
        success,
        returnData,
      }
      // OffchainLookup(address,string[],bytes,bytes4,bytes)
      if (!success && returnData.startsWith('0x556f1830')) {
        try {
          const newData = await ccipLookup(client, transactions[i], returnData)
          if (newData) {
            newObj = { success: true, returnData: newData }
          }
        } catch {}
      }
      return newObj
    }),
  )
  return ccipChecked
}

const multicallWrapper = generateFunction({ encode, decode })

export default multicallWrapper
