import type { Hex } from 'viem'
import { zeroAddress } from 'viem'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  publicClient as client,
  deploymentAddresses,
  testClient,
} from '../../../test/addTestContracts.js'
import { getOwner } from './getOwner.js'

let snapshot: Hex

beforeEach(async () => {
  snapshot = await testClient.snapshot()
})

afterEach(async () => {
  await testClient.revert({ id: snapshot })
})

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

  it('returns zero address once the name has expired', async () => {
    // `example` is registered for 1 year; warp past expiry + grace so the
    // registry reports it AVAILABLE while still retaining `latestOwner`.
    await testClient.increaseTime({ seconds: 400 * 24 * 60 * 60 })
    await testClient.mine({ blocks: 1 })

    const owner = await getOwner(client, {
      registryAddress: deploymentAddresses.ETHRegistry,
      label: 'example',
    })

    expect(owner).toEqual(zeroAddress)
  })
})
