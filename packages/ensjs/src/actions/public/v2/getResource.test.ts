import { describe, expect, it } from 'vitest'
import { publicClient as client } from '../../../test/addTestContracts.js'
import { getResource } from './getResource.js'

const registryAddress = '0x8f86403A4DE0BB5791fa46B8e795C547942fE4Cf'

describe('getResource', () => {
  it('returns the resource ID for a registered label', async () => {
    const resource = await getResource(client, {
      registryAddress,
      label: 'example',
    })

    expect(resource).toEqual(
      50581729048717371578262585285492117321305276024434183435897035210102327476224n,
    )
  })
})
