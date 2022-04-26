import { ethers } from 'ethers'
import { ENS } from '..'
import setup from './setup'

let ENSInstance: ENS
let revert: Awaited<ReturnType<typeof setup>>['revert']
let provider: ethers.providers.JsonRpcProvider
let accounts: string[]

beforeAll(async () => {
  ;({ ENSInstance, revert, provider } = await setup())
  accounts = await provider.listAccounts()
})

afterAll(async () => {
  await revert()
})

describe('getExpiry', () => {
  it('should get the expiry for a name', async () => {
    const result = await ENSInstance.getExpiry('jefflau.eth')
    expect(result).toBeTruthy()
    expect(result).toBeInstanceOf(Date)
  })
  it('should throw an error for a non .eth name', async () => {
    try {
      await ENSInstance.getExpiry('sub.jefflau.eth')
      expect(false).toBeTruthy()
    } catch {
      expect(true).toBeTruthy()
    }
  })
})
