import { ethers } from 'ethers'
import { ENS } from '..'
import setup from './setup'

let ensInstance: ENS
let providerFake: ethers.providers.JsonRpcProvider

beforeAll(async () => {
  ;({ ensInstance } = await setup())
  providerFake = new ethers.providers.JsonRpcProvider(
    'http://localhost:34023',
    'ropsten',
  )
})

describe('withProvider', () => {
  it('should be able to use a new provider', async () => {
    const addr = await ensInstance.getAddr('with-profile.eth')
    expect(addr).toBeTruthy()

    try {
      await ensInstance.withProvider(providerFake).getOwner('with-profile.eth')
      expect(false).toBeTruthy()
    } catch {
      expect(true).toBeTruthy()
    }
  })
})
