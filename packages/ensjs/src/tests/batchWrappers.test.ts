import { ENS } from '..'
import setup from './setup'

let ENSInstance: ENS

beforeAll(async () => {
  ;({ ENSInstance } = await setup())
})

describe('batchWrappers', () => {
  it('should batch calls together', async () => {
    const textTx = (await ENSInstance._getTextBatch('jefflau.eth', 'description'))
    const batch = await ENSInstance.resolverMulticallWrapper.raw([
      textTx.raw,
      (await ENSInstance._getTextBatch('jefflau.eth', 'url')).raw,
      await ENSInstance._getAddr.raw('jefflau.eth'),
    ])
    const universalResponse = await ENSInstance.universalWrapper(
      'jefflau.eth',
      batch.data,
    )
    const [batchDecoded] = await ENSInstance.resolverMulticallWrapper.decode(
      universalResponse?.data,
    )
    const decoded1 = await textTx.decode({}, batchDecoded[0])
    const decoded2 = await textTx.decode({}, batchDecoded[1])
    const decoded3 = await ENSInstance._getAddr.decode(batchDecoded[2])
    expect(decoded1).toBe('Hello2')
    expect(decoded2).toBe('twitter.com')
    expect(decoded3).toBe('0x866B3c4994e1416B7C738B9818b31dC246b95eEE')
  })
})
