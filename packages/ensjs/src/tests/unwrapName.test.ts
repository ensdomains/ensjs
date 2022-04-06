import { ethers, utils } from 'ethers'
import { ENS } from '..'
import setup from './setup'

let ENSInstance: ENS
let revert: Awaited<ReturnType<typeof setup>>['revert']
let createSnapshot: Awaited<ReturnType<typeof setup>>['createSnapshot']
let provider: ethers.providers.JsonRpcProvider
let accounts: string[]

beforeAll(async () => {
  ;({ ENSInstance, revert, createSnapshot, provider } = await setup())
  accounts = await provider.listAccounts()
})

afterAll(async () => {
  await revert()
})

describe('wrapName', () => {
  beforeEach(async () => {
    await revert()
  })
  it('should return a .eth unwrap name transaction and succeed', async () => {
    const wrapNameTx = await ENSInstance.wrapName(
      'parthtejpal.eth',
      accounts[0],
    )
    await wrapNameTx.wait()

    const tx = await ENSInstance.unwrapName(
      'parthtejpal.eth',
      accounts[0],
      accounts[0],
    )
    expect(tx).toBeTruthy()
    await tx.wait()

    const baseRegistrar = await ENSInstance.contracts!.getBaseRegistrar()!
    const result = await baseRegistrar.ownerOf(
      utils.solidityKeccak256(['string'], ['parthtejpal']),
    )
    expect(result).toBe(accounts[0])
  })
  it('should return a regular unwrap name transaction and succeed', async () => {
    const wrapNameTx = await ENSInstance.wrapName(
      'parthtejpal.eth',
      accounts[0],
    )
    await wrapNameTx.wait()
    const createSubnameTx = await ENSInstance.createSubname({
      contract: 'nameWrapper',
      name: 'test.parthtejpal.eth',
      owner: accounts[0],
      shouldWrap: true,
      options: { addressOrIndex: 0 },
    })
    await createSubnameTx.wait()

    const tx = await ENSInstance.unwrapName('test.parthtejpal.eth', accounts[0])
    expect(tx).toBeTruthy()
    await tx.wait()

    const registry = await ENSInstance.contracts!.getRegistry()!
    const result = await registry.owner(utils.namehash('test.parthtejpal.eth'))
    expect(result).toBe(accounts[0])
  })
})