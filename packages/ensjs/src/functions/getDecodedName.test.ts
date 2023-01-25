import { ENS } from '..'
import setup from '../tests/setup'

let ensInstance: ENS

beforeAll(async () => {
  ;({ ensInstance } = await setup())
})

describe('getDecodedName', () => {
  it('should return undefined for a name that is not wrapped', async () => {
    const result = await ensInstance.getDecodedName('test123.eth')
    expect(result).toBeUndefined()
  })
  it('should return decoded name for a wrapped name with encoded labels', async () => {
    const result = await ensInstance.getDecodedName(
      '[9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658].wrapped-with-subnames.eth',
    )
    expect(result).toBeDefined()
    expect(result).toBe('test.wrapped-with-subnames.eth')
  })
})
