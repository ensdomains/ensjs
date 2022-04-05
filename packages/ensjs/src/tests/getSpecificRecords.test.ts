import { ENS } from '..'
import setup from './setup'

let ENSInstance: ENS
let revert: Awaited<ReturnType<typeof setup>>['revert']
let createSnapshot: Awaited<ReturnType<typeof setup>>['createSnapshot']

beforeAll(async () => {
  ;({ ENSInstance, revert, createSnapshot } = await setup())
})

describe('getSpecificRecord', () => {
  describe('getContentHash', () => {
    it('should return a contenthash object from a name with a valid record', async () => {
      const result = await ENSInstance.getContentHash('matoken.eth')
      expect(result).toHaveProperty('decoded')
    })
    it('should return null from a name with no record', async () => {
      const result = await ENSInstance.getContentHash('jefflau.eth')
      expect(result).toBeNull()
    })
  })

  describe('getText', () => {
    it('should return a record from a key', async () => {
      const result = await ENSInstance.getText('jefflau.eth', 'description')
      expect(result).toBe('Hello2')
    })

    it('should return null for a non-existent key', async () => {
      const result = await ENSInstance.getText(
        'jefflau.eth',
        'thiskeydoesntexist',
      )
      expect(result).toBeNull()
    })
  })

  describe('getAddr', () => {
    it('should return the ETH addr record if no coinType is provided', async () => {
      const result = await ENSInstance.getAddr('jefflau.eth')
      expect(result).toBe('0x866B3c4994e1416B7C738B9818b31dC246b95eEE')
    })
    it('should return the correct address based on a coin ID input as a number', async () => {
      const result = await ENSInstance.getAddr('jefflau.eth', 61)
      expect((result as any).addr).toBe(
        '0x866B3c4994e1416B7C738B9818b31dC246b95eEE',
      )
      expect((result as any).coin).toBe('ETC')
    })
    it('should return the correct address based on a coin ID input as a string', async () => {
      const result = await ENSInstance.getAddr('jefflau.eth', '61')
      expect((result as any).addr).toBe(
        '0x866B3c4994e1416B7C738B9818b31dC246b95eEE',
      )
      expect((result as any).coin).toBe('ETC')
    })
    it('should return the correct address based on a coin name', async () => {
      const result = await ENSInstance.getAddr('jefflau.eth', 'ETC')
      expect((result as any).addr).toBe(
        '0x866B3c4994e1416B7C738B9818b31dC246b95eEE',
      )
      expect((result as any).coin).toBe('ETC')
    })
    it('should return null for a non-existent coin', async () => {
      const result = await ENSInstance.getAddr('jefflau.eth', 'BNB')
      expect(result).toBeNull()
    })
  })
})
