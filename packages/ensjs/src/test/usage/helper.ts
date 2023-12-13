import getPrice from '../../functions/public/getPrice.js'
import commitName from '../../functions/wallet/commitName.js'
import registerName from '../../functions/wallet/registerName.js'
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
