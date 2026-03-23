import { zeroAddress } from 'viem'
import { describe, expect, it } from 'vitest'
import { publicClient as client } from '../../../test/addTestContracts.js'
import { getOwner } from './getOwner.js'

const registryAddress = '0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf'

describe('getOwner', () => {
  it('returns the owner address for a V2 name', async () => {
    const owner = await getOwner(client, {
      registryAddress,
      label: 'example',
    })

    expect(owner).not.toEqual(zeroAddress)
  })

  it('returns zero address for a non-existent label', async () => {
    const owner = await getOwner(client, {
      registryAddress,
      label: 'thislabeldoesnotexistatall',
    })

    expect(owner).toEqual(zeroAddress)
  })
})
