import { ethers } from 'ethers'
import { ENS } from '..'
import setup from '../tests/setup'

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

jest.setTimeout(20000)

describe('populateTransaction', () => {
  beforeEach(async () => {
    await revert()
  })
  it('should return a transaction successfully', async () => {
    const tx = await ENSInstance.setName('fleek.eth')
    expect(tx).toBeTruthy()
    if (tx) {
      await tx.wait()
      expect(tx.hash).toBeTruthy()
    }
  })
  it('should return a populated transaction successfully', async () => {
    const tx = await ENSInstance.setName.populateTransaction('fleek.eth')
    expect(tx).toBeTruthy()
    if (tx) {
      expect(tx).not.toHaveProperty('hash')
    }
  })
})
