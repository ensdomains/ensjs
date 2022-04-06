import { ethers } from 'ethers'
import { ENSArgs, GenericGeneratedRawFunction } from '.'

export async function _batch(
  { contracts }: ENSArgs<'contracts'>,
  transactions: ethers.providers.TransactionRequest[],
  requireSuccess: boolean = false,
) {
  const multicall = await contracts?.getMulticall()!
  return multicall.callStatic.tryAggregate(
    requireSuccess,
    transactions.map((tx) => ({
      target: tx.to,
      callData: tx.data,
    })),
  )
}

type BatchItem = [any, ...any[]]

// export async function batch(
//   { contracts }: ENSArgs<'contracts'>,
//   ...items: BatchItem[]
// ) {
//   console.log(items)
//   const rawDataArr: { to: string; data: string }[] = await Promise.all(
//     items.map(([func, ...args]) => {
//       if (!func.raw) {
//         throw new Error(`${func.name} is not batchable`)
//       }
//       return func.raw(...args)
//     }),
//   )
//   const response = await _batch({ contracts }, rawDataArr)
//   return Promise.all(
//     response.map((ret: any, i: number) =>
//       items[i][0].decode(ret.returnData, ...items[i].slice(1)),
//     ),
//   )
// }

export async function batch(
  dependencies: ENSArgs<'contracts' | 'universalWrapper'>,
  ...items: any
) {
  const { contracts } = dependencies
  const txObjects = await Promise.all(items)
  const rawDataArr = txObjects.map(item => item.raw)
  const response = await _batch({ contracts }, rawDataArr)
  
  return Promise.all(
      response.map((ret: any, i: number) =>
      txObjects[i].decode(dependencies, ret.returnData),
      ),
    )
}
