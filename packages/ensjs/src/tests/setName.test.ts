import { ethers } from 'ethers'
import { ENS } from '..'
import setup from './setup'

let ENSInstance: ENS
let revert: Awaited<ReturnType<typeof setup>>['revert']
let createSnapshot: Awaited<ReturnType<typeof setup>>['createSnapshot']
let provider: ethers.providers.JsonRpcProvider

beforeAll(async () => {
  ;({ ENSInstance, revert, createSnapshot, provider } = await setup())
})

afterAll(async () => {
  await revert()
})

describe('setName', () => {
  it('should return a transaction for a name and set successfully', async () => {
    const tx = await ENSInstance.setName('fleek.eth')
    expect(tx).toBeTruthy()
    await tx.wait()
    const result = await ENSInstance.getName((await provider.listAccounts())[0])
    expect(result).toMatchObject({
      name: 'fleek.eth',
      match: true,
    })
  })
})
