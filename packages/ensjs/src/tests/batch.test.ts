import { ENS } from '..'
import setup from './setup'

let ENSInstance: ENS

beforeAll(async () => {
  ;({ ENSInstance } = await setup())
})

describe('batch', () => {
  it('should batch calls together', async () => {
    const result = await ENSInstance.batch(
      [ENSInstance.getText, 'jefflau.eth', 'description'],
      [ENSInstance.getAddr, 'jefflau.eth'],
      [ENSInstance.getName, '0x866B3c4994e1416B7C738B9818b31dC246b95eEE'],
    )
    expect(result[0]).toBe('Hello2')
    expect(result[1]).toBe('0x866B3c4994e1416B7C738B9818b31dC246b95eEE')
    expect(result[2]).toMatchObject({
      name: 'jefflau.eth',
      match: true,
    })
  })
})
