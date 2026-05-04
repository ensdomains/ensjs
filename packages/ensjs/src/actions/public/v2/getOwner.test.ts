import { zeroAddress } from 'viem'
import { describe, expect, it } from 'vitest'
import {
  publicClient as client,
  deploymentAddresses,
} from '../../../test/addTestContracts.js'
import { getOwner } from './getOwner.js'

describe('getOwner', () => {
  it('returns the owner address for a V2 name', async () => {
    const owner = await getOwner(client, {
      registryAddress: deploymentAddresses.ETHRegistry,
      label: 'example',
    })

    expect(owner).not.toEqual(zeroAddress)
  })

  it('returns zero address for a non-existent label', async () => {
    const owner = await getOwner(client, {
      registryAddress: deploymentAddresses.ETHRegistry,
      label: 'thislabeldoesnotexistatall',
    })

    expect(owner).toEqual(zeroAddress)
  })
})
