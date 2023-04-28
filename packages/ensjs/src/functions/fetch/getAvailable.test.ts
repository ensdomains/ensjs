import { testClient } from '../../tests/addTestContracts'
import getAvailable from './getAvailable'

describe('getAvailable', () => {
  it('should return false for a name that is unavailable', async () => {
    const result = await getAvailable(testClient, { name: 'test123.eth' })
    expect(typeof result).toBe('boolean')
    expect(result).toBe(false)
  })
  it('should return true for a name that is available', async () => {
    const result = await getAvailable(testClient, {
      name: 'available-name.eth',
    })
    expect(typeof result).toBe('boolean')
    expect(result).toBe(true)
  })
})
