import { ENS } from '..'
import setup from './setup'

let ensInstance: ENS
let revert: Awaited<ReturnType<typeof setup>>['revert']

beforeAll(async () => {
  ;({ ensInstance, revert } = await setup())
})

afterAll(async () => {
  await revert()
})

jest.setTimeout(20000)

describe('populateTransaction', () => {
  beforeEach(async () => {
    await revert()
  })
  it('should return a transaction successfully', async () => {
    const tx = await ensInstance.setName('fleek.eth')
    expect(tx).toBeTruthy()
    if (tx) {
      await tx.wait()
      expect(tx.hash).toBeTruthy()
    }
  })
  it('should return a populated transaction successfully', async () => {
    const tx = await ensInstance.setName.populateTransaction('fleek.eth')
    expect(tx).toBeTruthy()
    if (tx) {
      expect(tx).not.toHaveProperty('hash')
    }
  })
})
