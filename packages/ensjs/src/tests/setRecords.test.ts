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

describe('setRecords', () => {
  it('should return a transaction to the resolver and set successfully', async () => {
    const tx = await ENSInstance.setRecords('parthtejpal.eth', {
      coinTypes: [
        { key: 'ETC', value: '0x42D63ae25990889E35F215bC95884039Ba354115' },
      ],
      texts: [{ key: 'foo', value: 'bar' }],
    })
    expect(tx).toBeTruthy()
    await tx.wait()
    const result = await ENSInstance.batch(
      [ENSInstance.getText, 'parthtejpal.eth', 'foo'],
      [ENSInstance.getAddr, 'parthtejpal.eth', 'ETC'],
    )
    expect(result[0]).toBe('bar')
    expect(result[1]).toMatchObject({
      coin: 'ETC',
      addr: '0x42D63ae25990889E35F215bC95884039Ba354115',
    })
  })
})
