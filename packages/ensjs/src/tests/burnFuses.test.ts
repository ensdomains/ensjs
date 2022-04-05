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

describe('burnFuses', () => {
  beforeEach(async () => {
    await revert()
  })
  it('should return a transaction and succeed', async () => {
    const wrapNameTx = await ENSInstance.wrapName(
      'parthtejpal.eth',
      accounts[0],
    )
    await wrapNameTx.wait()
    const tx = await ENSInstance.burnFuses('parthtejpal.eth', {
      cannotUnwrap: true,
      cannotCreateSubdomain: true,
      cannotSetTtl: true,
    })
    expect(tx).toBeTruthy()
    await tx.wait()
    const result = await ENSInstance.getFuses('parthtejpal.eth')
    expect(result).toMatchObject({
      cannotUnwrap: true,
      cannotBurnFuses: false,
      cannotTransfer: false,
      cannotSetResolver: false,
      cannotSetTtl: true,
      cannotCreateSubdomain: true,
      cannotReplaceSubdomain: false,
      canDoEverything: false,
    })
  })
})
