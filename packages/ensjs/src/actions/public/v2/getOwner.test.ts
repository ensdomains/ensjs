import { zeroAddress } from 'viem'
import { describe, expect, it } from 'vitest'
import { publicClient as client } from '../../../test/addTestContracts.js'
import { getOwner } from './getOwner.js'

describe('getOwner', () => {
  it('returns the owner address for a V2 name', async () => {
    const owner = await getOwner(client, {
      name: 'example.eth',
    })

    expect(owner).not.toEqual(zeroAddress)
  })

  it('returns zero address for a non-existent name', async () => {
    const owner = await getOwner(client, {
      name: 'thislabeldoesnotexistatall.eth',
    })

    expect(owner).toEqual(zeroAddress)
  })
})
