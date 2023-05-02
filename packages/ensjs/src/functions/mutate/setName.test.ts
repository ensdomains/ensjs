import { Address, Hex } from 'viem'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { setApprovalForAllSnippet } from '../../contracts/registry'
import {
  publicClient,
  testClient,
  walletClient,
} from '../../tests/addTestContracts'
import getName from '../fetch/getName'
import setName from './setName'

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

it('should return a transaction for a name and set successfully', async () => {
  const tx = await setName(walletClient, {
    name: 'test123.eth',
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx })
  expect(receipt.status).toBe('success')

  const resolvedName = await getName(publicClient, {
    address: accounts[1],
  })
  expect(resolvedName!.name).toBe('test123.eth')
})

it("should return a transaction for setting another address' name and succeed", async () => {
  const setApprovedForAllTx = await walletClient.writeContract({
    abi: setApprovalForAllSnippet,
    functionName: 'setApprovalForAll',
    address: getChainContractAddress({
      client: walletClient,
      contract: 'ensRegistry',
    }),
    args: [accounts[2], true],
    account: accounts[1],
  })
  expect(setApprovedForAllTx).toBeTruthy()
  const setApprovedForAllReceipt = await publicClient.waitForTransactionReceipt(
    { hash: setApprovedForAllTx },
  )
  expect(setApprovedForAllReceipt.status).toBe('success')

  const tx = await setName(walletClient, {
    name: 'test123.eth',
    address: accounts[1],
    account: accounts[2],
  })
  expect(tx).toBeTruthy()
  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx })
  expect(receipt.status).toBe('success')

  const resolvedName = await getName(publicClient, {
    address: accounts[1],
  })
  expect(resolvedName!.name).toBe('test123.eth')
})
