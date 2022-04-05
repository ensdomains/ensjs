import { ethers } from 'ethers'
import { ENS } from '..'
import setup from './setup'

let ENSInstance: ENS
let revert: Awaited<ReturnType<typeof setup>>['revert']
let createSnapshot: Awaited<ReturnType<typeof setup>>['createSnapshot']
let provider: ethers.providers.JsonRpcProvider

beforeAll(async () => {
  ;({ ENSInstance, revert, createSnapshot, provider } = await setup())
  const accounts = await provider.listAccounts()
  const tx = await ENSInstance.wrapName('parthtejpal.eth', accounts[0])
  await tx.wait()
})

afterAll(async () => {
  await revert()
})

describe('getFuses', () => {
  it('should return null for an unwrapped name', async () => {
    const result = await ENSInstance.getFuses('jefflau.eth')
    expect(result).toBeNull()
  })
  it('should return with canDoEverything set to true for a name with no fuses burned', async () => {
    const result = await ENSInstance.getFuses('parthtejpal.eth')
    expect(result).toBeTruthy()
    if (result) {
      expect(result.canDoEverything).toBe(true)
    }
  })
  it('should return with other correct fuses', async () => {
    const tx = await ENSInstance.burnFuses('parthtejpal.eth', {
      cannotUnwrap: true,
      cannotSetTtl: true,
      cannotReplaceSubdomain: true,
    })
    await tx.wait()
    const result = await ENSInstance.getFuses('parthtejpal.eth')
    expect(result).toBeTruthy()
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
})
