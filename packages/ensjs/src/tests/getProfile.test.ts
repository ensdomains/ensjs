import { ENS } from '..'
import setup from './setup'

let ENSInstance: ENS

beforeAll(async () => {
  ;({ ENSInstance } = await setup())
})

const checkRecords = (
  result: Record<string, any> | null,
  textLength = 4,
  coinTypeLength = 5,
) => {
  expect(result).toBeTruthy()
  if (result) {
    expect(result.records?.texts).toHaveLength(textLength)
    expect(result.records?.coinTypes).toHaveLength(coinTypeLength)
    expect(result.resolverAddress).toBe(
      '0x42D63ae25990889E35F215bC95884039Ba354115',
    )
  }
}

describe('getProfile', () => {
  describe('with an address', () => {
    it('should return a profile object with no other args', async () => {
      const result = await ENSInstance.getProfile(
        '0x866B3c4994e1416B7C738B9818b31dC246b95eEE',
      )
      expect((result as any).name).toBe('jefflau.eth')
      expect((result as any).address).toBeUndefined()
      checkRecords(result)
    })
    it('should return a profile object with specified records', async () => {
      const result = await ENSInstance.getProfile(
        '0x866B3c4994e1416B7C738B9818b31dC246b95eEE',
        { texts: ['description', 'url'], coinTypes: ['ETC', '0'] },
      )
      expect((result as any).name).toBe('jefflau.eth')
      expect((result as any).address).toBeUndefined()
      checkRecords(result, 2, 3)
    })
    it('should return a profile object with all of each specified record type', async () => {
      const result = await ENSInstance.getProfile(
        '0x866B3c4994e1416B7C738B9818b31dC246b95eEE',
        { texts: true, coinTypes: true },
      )
      checkRecords(result)
    })
    it('should return null for an address without a name', async () => {
      const result = await ENSInstance.getProfile(
        '0x8e8db5ccef88cca9d624701db544989c996e3216',
      )
      expect(result).toBeUndefined()
    })
  })
  describe('with a name', () => {
    it('should return a profile object with no other args', async () => {
      const result = await ENSInstance.getProfile('jefflau.eth')
      expect((result as any).address).toBe(
        '0x866B3c4994e1416B7C738B9818b31dC246b95eEE',
      )
      checkRecords(result)
    })
    it('should return a profile object with specified records', async () => {
      const result = await ENSInstance.getProfile('jefflau.eth', {
        texts: ['description', 'url'],
        coinTypes: ['ETC', '0'],
      })
      expect((result as any).address).toBe(
        '0x866B3c4994e1416B7C738B9818b31dC246b95eEE',
      )
      checkRecords(result, 2, 3)
    })
    it('should return a profile object with all of each specified record type', async () => {
      const result = await ENSInstance.getProfile('jefflau.eth', {
        texts: true,
        coinTypes: true,
      })
      checkRecords(result)
    })
    it('should return null for an unregistered name', async () => {
      const result = await ENSInstance.getProfile('test123123123cool.eth')
      expect(result).toBeUndefined()
    })
  })
  describe('with an unmigrated name', () => {
    beforeAll(async () => {
      ;({ ENSInstance } = await setup(true))
      jest.setTimeout(20000)
    })
    it('should return an object with isMigrated false and a message', async () => {
      const result = await ENSInstance.getProfile('jefflau.test')
      expect(result).toBeTruthy()
      if (result) {
        expect(result.isMigrated).toBe(false)
        expect(result.message).toBe("Records fetch didn't complete")
      }
    })
  })
})
