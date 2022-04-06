import { ethers } from 'ethers'
import { ENS } from '..'
import setup from './setup'

let ENSInstance: ENS
let providerFake: ethers.providers.JsonRpcProvider

beforeAll(async () => {
  ;({ ENSInstance } = await setup())
  providerFake = new ethers.providers.JsonRpcProvider(
    'http://localhost:34023',
    'ropsten',
  )
})

describe('withProvider', () => {
  it('should be able to use a new provider', async () => {
    const addr = await ENSInstance.getAddr('jefflau.eth')
    expect(addr).toBeTruthy()

    try {
      await ENSInstance.withProvider(providerFake).getOwner('jefflau.eth')
      expect(false).toBeTruthy()
    } catch {
      expect(true).toBeTruthy()
    }
  })
})
