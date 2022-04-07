import { ethers } from 'ethers'
import { ENSArgs, GenericGeneratedRawFunction } from '.'

export async function _batch(
  { provider, address, contracts }: any,
  transactions: ethers.providers.TransactionRequest[],
  requireSuccess: boolean = false,
) {
  //const multicall = await contracts?.getMulticall()!
  const module = await import('./contracts/multicall')
  const multicall = module.default(provider, "0xcA11bde05977b3631167028862bE2a173976CA11")

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
  { provider, address, contracts }: any,
  ...items: any
) {
  const txObjects = await Promise.all(items)
  const rawDataArr = txObjects.map(item => item.raw)
  const response = await _batch({ provider, address: "", contracts }, rawDataArr)
  
  return Promise.all(
      response.map((ret: any, i: number) =>
      txObjects[i].decode({}, ret.returnData),
      ),
    )
}
