import { ethers } from 'ethers'
import { ENS } from '..'
import { hexEncodeName } from '../utils/hexEncodedName'
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

describe('setName', () => {
  it('should return a transaction for a name and set successfully', async () => {
    const tx = await ENSInstance.setName('fleek.eth')
    expect(tx).toBeTruthy()
    await tx.wait()

    const universalResolver =
      await ENSInstance.contracts!.getUniversalResolver()!
    const reverseNode = accounts[0].toLowerCase().substring(2) + '.addr.reverse'
    const result = await universalResolver.reverse(hexEncodeName(reverseNode))
    expect(result[0]).toBe('fleek.eth')
  })
})
