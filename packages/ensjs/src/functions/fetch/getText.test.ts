import { testClient } from '../../tests/addTestContracts'
import getText from './getText'

describe('getText()', () => {
  it('should return a record from a key', async () => {
    const result = await getText(testClient, {
      name: 'with-profile.eth',
      key: 'description',
    })
    expect(result).toBe('Hello2')
  })

  it('should return null for a non-existent key', async () => {
    const result = await getText(testClient, {
      name: 'with-profile.eth',
      key: 'thiskeydoesntexist',
    })
    expect(result).toBeNull()
  })
})
