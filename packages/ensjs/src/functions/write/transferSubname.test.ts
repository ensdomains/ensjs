import { Address, Hex } from 'viem'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../tests/addTestContracts'
import getOwner from '../read/getOwner'
import transferSubname from './transferSubname'

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

it('should allow transferring a subname on the registry', async () => {
  const tx = await transferSubname(walletClient, {
    name: 'test.with-subnames.eth',
    contract: 'registry',
    newOwnerAddress: accounts[1],
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const owner = await getOwner(publicClient, {
    name: 'test.with-subnames.eth',
    contract: 'registry',
  })
  expect(owner!.owner).toBe(accounts[1])
})
it('should allow transferring a subname on the namewrapper', async () => {
  const tx = await transferSubname(walletClient, {
    name: 'test.wrapped-with-subnames.eth',
    contract: 'nameWrapper',
    newOwnerAddress: accounts[1],
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const owner = await getOwner(publicClient, {
    name: 'test.wrapped-with-subnames.eth',
    contract: 'nameWrapper',
  })
  expect(owner!.owner).toBe(accounts[1])
})
it('should error if unknown contract', async () => {
  await expect(
    transferSubname(walletClient, {
      name: 'test.with-subnames.eth',
      contract: 'random' as any,
      newOwnerAddress: accounts[1],
      account: accounts[1],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "Invalid contract type: random

    - Supported contract types: registry, nameWrapper

    Version: @ensdomains/ensjs@3.0.0-alpha.62"
  `)
})
