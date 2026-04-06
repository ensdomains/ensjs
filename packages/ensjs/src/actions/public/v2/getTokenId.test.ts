import { describe, expect, it } from 'vitest'
import { publicClient as client } from '../../../test/addTestContracts.js'
import { getTokenId } from './getTokenId.js'

const registryAddress = '0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf'

describe('getTokenId', () => {
  it('returns the token ID for a registered label', async () => {
    const tokenId = await getTokenId(client, {
      registryAddress,
      label: 'example',
    })

    expect(tokenId).toEqual(
      50581729048717371578262585285492117321305276024434183435897035210102327476224n,
    )
  })
})
