import { publicClient } from '../../tests/addTestContracts'
import getTextRecord from './getTextRecord'

describe('getTextRecord()', () => {
  it('should return a record from a key', async () => {
    const result = await getTextRecord(publicClient, {
      name: 'with-profile.eth',
      key: 'description',
    })
    expect(result).toBe('Hello2')
  })

  it('should return null for a non-existent key', async () => {
    const result = await getTextRecord(publicClient, {
      name: 'with-profile.eth',
      key: 'thiskeydoesntexist',
    })
    expect(result).toBeNull()
  })
})
