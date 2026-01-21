import { zeroAddress } from 'viem'
import { describe, expect, it } from 'vitest'
import {
  publicClientL2 as client,
  localhostL2,
} from '../../../test/addTestContracts.js'
import { getOwner } from './getOwner.js'

describe('getOwner', () => {
  it.skip('returns the owner address for a V2 name', async () => {
    // TODO: Register a test name on L2 first, then test retrieval
    const registryAddress = localhostL2.contracts.ensV2EthRegistry.address
    const owner = await getOwner(client, {
      registryAddress,
      label: 'testname',
    })

    expect(owner).not.toEqual(zeroAddress)
  })

  it('returns zero address for a non-existent label', async () => {
    const registryAddress = localhostL2.contracts.ensV2EthRegistry.address
    const owner = await getOwner(client, {
      registryAddress,
      label: 'thislabeldoesnotexistatall',
    })

    expect(owner).toEqual(zeroAddress)
  })
})
