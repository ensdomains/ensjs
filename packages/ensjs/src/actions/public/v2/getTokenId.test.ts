import { describe, expect, it } from 'vitest'
import {
  publicClient as client,
  deploymentAddresses,
} from '../../../test/addTestContracts.js'
import { getTokenId } from './getTokenId.js'

describe('getTokenId', () => {
  it('returns the token ID for a registered label', async () => {
    const tokenId = await getTokenId(client, {
      registryAddress: deploymentAddresses.ETHRegistry,
      label: 'example',
    })

    expect(tokenId).toEqual(
      50581729048717371578262585285492117321305276024434183435897035210102327476224n,
    )
  })
})
