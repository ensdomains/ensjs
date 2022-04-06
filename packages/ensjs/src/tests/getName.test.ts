import { ENS } from '..'
import setup from './setup'

let ENSInstance: ENS

beforeAll(async () => {
  ;({ ENSInstance } = await setup())
})

describe('getName', () => {
  it('should get a primary name from an address', async () => {
    const result = await ENSInstance.getName(
      '0x866B3c4994e1416B7C738B9818b31dC246b95eEE',
    )
    expect(result).toBeTruthy()
    if (result) {
      expect(result.name).toBe('jefflau.eth')
      expect(result.match).toBeTruthy()
    }
  })
  it('should return null for an address with no primary name', async () => {
    const result = await ENSInstance.getName(
      '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0',
    )
    expect(result).toBeNull()
  })
})
