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

describe('wrapName', () => {
  beforeEach(async () => {
    await revert()
  })
  it('should return a wrap name transaction and succeed', async () => {
    const tx = await ENSInstance.wrapName('parthtejpal.eth', accounts[0])
    expect(tx).toBeTruthy()
    await tx.wait()
    const result = await ENSInstance.getFuses('parthtejpal.eth')
    expect(result).toMatchObject({
      cannotUnwrap: false,
      cannotBurnFuses: false,
      cannotTransfer: false,
      cannotSetResolver: false,
      cannotSetTtl: false,
      cannotCreateSubdomain: false,
      cannotReplaceSubdomain: false,
      canDoEverything: true,
    })
  })
  it('should allow initial fuses', async () => {
    const tx = await ENSInstance.wrapName('parthtejpal.eth', accounts[0], {
      cannotUnwrap: true,
      cannotSetTtl: true,
      cannotReplaceSubdomain: true,
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
      cannotCreateSubdomain: false,
      cannotReplaceSubdomain: true,
      canDoEverything: false,
    })
  })
  it('should allow an initial resolver address', async () => {
    const tx = await ENSInstance.wrapName(
      'parthtejpal.eth',
      accounts[0],
      undefined,
      '0x42D63ae25990889E35F215bC95884039Ba354115',
    )
    expect(tx).toBeTruthy()
    await tx.wait()
    const result = await ENSInstance.getResolver('parthtejpal.eth')
    expect(result).toBe('0x42D63ae25990889E35F215bC95884039Ba354115')
  })
})
