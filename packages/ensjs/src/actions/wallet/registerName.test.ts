import type { Address, Hex } from 'viem'
import { afterEach, beforeAll, beforeEach, expect, it } from 'vitest'
import {
  testClient,
  waitForTransaction,
  walletClient,
} from '../../test/addTestContracts.js'
import type { L2RegistrationParameters } from '../../utils/l2RegisterHelpers.js'
import { commitName } from './commitName.js'
import { registerName } from './registerName.js'

let snapshot: Hex
let accounts: Address[]

beforeAll(async () => {
  accounts = await walletClient.getAddresses()
})

beforeEach(async () => {
  snapshot = await testClient.snapshot()
})

afterEach(async () => {
  await testClient.revert({ id: snapshot })
})

const secret = `0x${'a'.repeat(64)}` as Hex

it.skip('should return a registration transaction and succeed', async () => {
  const params: L2RegistrationParameters = {
    label: 'cool-swag',
    duration: 31536000,
    owner: accounts[1],
    secret,
  }
  const commitTx = await commitName(walletClient, {
    ...params,
    account: accounts[1],
  })
  expect(commitTx).toBeTruthy()
  const commitReceipt = await waitForTransaction(commitTx)

  expect(commitReceipt.status).toBe('success')

  await testClient.increaseTime({ seconds: 61 })
  await testClient.mine({ blocks: 1 })

  const tx = await registerName(walletClient, {
    ...params,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  // const owner = await publicClient.readContract({
  //   abi: nameWrapperOwnerOfSnippet,
  //   functionName: 'ownerOf',
  //   address: getChainContractAddress({
  //     chain: publicClient.chain,
  //     contract: 'ensNameWrapper',
  //   }),
  //   args: [BigInt(namehash(name))],
  // })
  // expect(owner).toBe(params.owner)
})
