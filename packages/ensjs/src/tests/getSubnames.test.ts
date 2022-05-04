import { ENS } from '..'
import setup from './setup'

let ENSInstance: ENS

beforeAll(async () => {
  ;({ ENSInstance } = await setup())
})

describe('getSubnames', () => {
  it('should get the subnames for a name', async () => {
    const result = await ENSInstance.getSubnames({
      name: 'jefflau.eth',
    })
    expect(result).toBeTruthy()
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('id')
    expect(result[0]).toHaveProperty('labelName')
    expect(result[0]).toHaveProperty('labelhash')
    expect(result[0]).toHaveProperty('isMigrated')
    expect(result[0]).toHaveProperty('name')
    expect(result[0]).toHaveProperty('owner')
    expect(result[0]).toHaveProperty('truncatedName')
  })
})
