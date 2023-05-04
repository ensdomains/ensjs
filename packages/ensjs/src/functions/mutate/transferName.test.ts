import { Address, Hex } from 'viem'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../tests/addTestContracts'
import getOwner from '../fetch/getOwner'
import transferName from './transferName'

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

it('should allow a transfer on the registry', async () => {
  const tx = await transferName(walletClient, {
    name: 'test.with-subnames.eth',
    newOwnerAddress: accounts[1],
    contract: 'registry',
    account: accounts[2],
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
it('should allow a regular transfer on the registrar', async () => {
  const tx = await transferName(walletClient, {
    name: 'test123.eth',
    newOwnerAddress: accounts[2],
    contract: 'registrar',
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const owner = await getOwner(publicClient, {
    name: 'test123.eth',
    contract: 'registrar',
  })
  expect(owner!.registrant).toBe(accounts[2])
})
it('should allow a reclaim on the registrar', async () => {
  const changeRegistryOwnerTx = await transferName(walletClient, {
    name: 'test123.eth',
    newOwnerAddress: accounts[2],
    contract: 'registry',
    account: accounts[1],
  })
  expect(changeRegistryOwnerTx).toBeTruthy()
  const changeRegistryOwnerReceipt = await waitForTransaction(
    changeRegistryOwnerTx,
  )
  expect(changeRegistryOwnerReceipt.status).toBe('success')

  const tx = await transferName(walletClient, {
    name: 'test123.eth',
    newOwnerAddress: accounts[1],
    contract: 'registrar',
    reclaim: true,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const owner = await getOwner(publicClient, {
    name: 'test123.eth',
    contract: 'registry',
  })
  expect(owner!.owner).toBe(accounts[1])
})
it('should allow a transfer on the namewrapper', async () => {
  const tx = await transferName(walletClient, {
    name: 'wrapped.eth',
    newOwnerAddress: accounts[2],
    contract: 'nameWrapper',
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const owner = await getOwner(publicClient, {
    name: 'wrapped.eth',
    contract: 'nameWrapper',
  })
  expect(owner!.owner).toBe(accounts[2])
})
it('should error if unknown contract', async () => {
  await expect(
    transferName(walletClient, {
      name: 'test123.eth',
      newOwnerAddress: accounts[2],
      contract: 'random' as any,
      account: accounts[1],
    }),
  ).rejects.toThrow('Unknown contract: random')
})
it('should error if reclaim is specified but contract is not registrar', async () => {
  await expect(
    transferName(walletClient, {
      name: 'test123.eth',
      newOwnerAddress: accounts[2],
      contract: 'registry',
      reclaim: true,
      account: accounts[1],
    } as any),
  ).rejects.toThrow("Can't reclaim name from non-registrar contract")
})
