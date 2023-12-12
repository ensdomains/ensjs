import getPrice from '../../functions/public/getPrice.js'
import commitName from '../../functions/wallet/commitName.js'
import registerName from '../../functions/wallet/registerName.js'
import { waitForTransaction } from '../addTestContracts.js'
import { walletClient } from '../addTestContracts.js'
import { publicClient } from '../addTestContracts.js'
import { testClient } from '../addTestContracts.js'
import type { RegistrationParameters } from '../../utils/registerHelpers.js'

// const accounts = await walletClient.getAddresses()
// type accountType = typeof accounts[0]
export const commitAndRegisterName = async (params: RegistrationParameters, account: any): Promise<string> => {
    const commitTx = await commitName(walletClient, {
      ...params,
      account: account,
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
      account: account,
      value: total,
    })
    expect(tx).toBeTruthy()
    const receipt = await waitForTransaction(tx)
    expect(receipt.status).toBe('success')

    return tx
  }