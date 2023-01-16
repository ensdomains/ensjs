import { ENS } from '..'
import setup from '../tests/setup'

let ensInstance: ENS
let revert: Awaited<ReturnType<typeof setup>>['revert']

beforeAll(async () => {
  ;({ ensInstance, revert } = await setup())
})

afterAll(async () => {
  await revert()
})

describe('getOwner', () => {
  it('should return nameWrapper as the ownership level for a wrapped name', async () => {
    const result = await ensInstance.getOwner('wrapped.eth')
    expect(result?.ownershipLevel).toBe('nameWrapper')
  })
})
