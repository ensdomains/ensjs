import { describe, expect, it } from 'vitest'
import {
  publicClient as client,
  deploymentAddresses,
} from '../../../test/addTestContracts.js'
import { getResource } from './getResource.js'

describe('getResource', () => {
  it('returns the resource ID for a registered label', async () => {
    const resource = await getResource(client, {
      registryAddress: deploymentAddresses.ETHRegistry,
      label: 'example',
    })

    expect(resource).toEqual(
      50581729048717371578262585285492117321305276024434183435897035210102327476224n,
    )
  })
})
