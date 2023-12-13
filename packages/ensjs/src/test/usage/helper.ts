import { rewindSubgraph } from '@ensdomains/ens-test-env'
import getPrice from '../../functions/public/getPrice.js'
import commitName from '../../functions/wallet/commitName.js'
import registerName from '../../functions/wallet/registerName.js'
import { createSubgraphClient } from '../../subgraph.js'
import type { RegistrationParameters } from '../../utils/registerHelpers.js'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../addTestContracts.js'

// const accounts = await walletClient.getAddresses()
// type accountType = typeof accounts[0]
export const commitAndRegisterName = async (
  params: RegistrationParameters,
  account: any,
): Promise<string> => {
  const commitTx = await commitName(walletClient, {
    ...params,
    account,
  })
  expect(commitTx).toBeTruthy()
  const commitReceipt = await waitForTransaction(commitTx)

  expect(commitReceipt.status).toBe('success')

  await testClient.increaseTime({ seconds: 61 })
  await testClient.mine({ blocks: 1 })

  const price = await getPrice(publicClient, {
    nameOrNames: params.name,
    duration: params.duration,
  })
  const total = price!.base + price!.premium

  const tx = await registerName(walletClient, {
    ...params,
    account,
    value: total,
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  return tx
}

export const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

const subgraphClient = createSubgraphClient({ client: publicClient })

export const getSubgraphBlock = (
  { depth }: { depth: number } = { depth: 0 },
): Promise<number> =>
  subgraphClient
    .request<{
      _meta: {
        block: {
          number: number
        }
      }
    }>(
      `
  {
    _meta {
      block {
        number
      }
    }
  }
`,
    )
    .then((res) => res._meta.block.number)
    .catch(async (e) => {
      console.error(e)
      await wait(1000)
      if (depth > 5) throw new Error('Could not get subgraph block')
      return getSubgraphBlock({ depth: depth + 1 })
    })

export const getCurrentBlock = () =>
  publicClient.getBlockNumber().then((b) => Number(b))

export const syncSubgraphBlock = async (
  {
    depth,
    changes,
    prevSubgraphBlock,
  }: { depth: number; changes: number; prevSubgraphBlock: number } = {
    depth: 0,
    changes: 0,
    prevSubgraphBlock: 0,
  },
): Promise<void> => {
  const subgraphBlock = await getSubgraphBlock()
  const currentBlock = await getCurrentBlock()
  if (subgraphBlock < currentBlock) {
    const params = {
      depth: depth + 1,
      changes: changes + (subgraphBlock !== prevSubgraphBlock ? 1 : 0),
      prevSubgraphBlock: subgraphBlock,
    }
    await wait(1000)
    return syncSubgraphBlock(params)
  }
  if (subgraphBlock >= currentBlock && depth === 0) {
    const blockNumber = parseInt(
      process.env.DEPLOYMENT_FINISHED_AT_BLOCK as string,
    )
    const blockHash = process.env.DEPLOYMENT_FINISHED_AT_HASH as `0x${string}`
    await rewindSubgraph({ blockNumber, blockHash })
    await wait(1000)
    return syncSubgraphBlock()
  }
  return
}
