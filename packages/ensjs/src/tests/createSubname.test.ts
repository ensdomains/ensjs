import { ethers } from 'ethers'
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

describe('createSubname', () => {
  beforeEach(async () => {
    await revert()
  })
  it('should allow creating a subname on the registry', async () => {
    const tx = await ENSInstance.createSubname({
      contract: 'registry',
      name: 'test.parthtejpal.eth',
      owner: accounts[0],
      options: { addressOrIndex: 0 },
    })
    expect(tx).toBeTruthy()
    await tx.wait()
    const result = await ENSInstance.getOwner('test.parthtejpal.eth')
    expect(result?.owner).toBe(accounts[0])
  })
  it('should allow creating a subname on the namewrapper unwrapped', async () => {
    const wrapNameTx = await ENSInstance.wrapName(
      'parthtejpal.eth',
      accounts[0],
    )
    await wrapNameTx.wait()
    const tx = await ENSInstance.createSubname({
      contract: 'nameWrapper',
      name: 'test.parthtejpal.eth',
      owner: accounts[0],
      shouldWrap: false,
      options: { addressOrIndex: 0 },
    })
    expect(tx).toBeTruthy()
    await tx.wait()
    const result = await ENSInstance.getOwner('test.parthtejpal.eth')
    expect(result?.owner).toBe(accounts[0])
    expect(result?.truthLevel).toBe('registry')
  })
  it('should allow creating and wrapping a subname on the namewrapper', async () => {
    const wrapNameTx = await ENSInstance.wrapName(
      'parthtejpal.eth',
      accounts[0],
    )
    await wrapNameTx.wait()
    const tx = await ENSInstance.createSubname({
      contract: 'nameWrapper',
      name: 'test.parthtejpal.eth',
      owner: accounts[0],
      shouldWrap: true,
      options: { addressOrIndex: 0 },
    })
    expect(tx).toBeTruthy()
    await tx.wait()
    const result = await ENSInstance.getOwner('test.parthtejpal.eth')
    expect(result?.owner).toBe(accounts[0])
    expect(result?.truthLevel).toBe('nameWrapper')
  })
})
