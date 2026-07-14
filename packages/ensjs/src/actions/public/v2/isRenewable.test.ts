import { describe, expect, it } from 'vitest'
import {
  deploymentAddresses,
  publicClient,
} from '../../../test/addTestContracts.js'
import { isRenewable } from './isRenewable.js'

const renewerAddress = deploymentAddresses.ETHRegistrar

describe('isRenewable', () => {
  it('returns true for a currently renewable registered label', async () => {
    const renewable = await isRenewable(publicClient, {
      renewerAddress,
      label: 'example',
    })

    expect(renewable).toBe(true)
  })

  it('returns false for a label that was never registered', async () => {
    const renewable = await isRenewable(publicClient, {
      renewerAddress,
      label: 'this-label-does-not-exist-on-the-devnet',
    })

    expect(renewable).toBe(false)
  })
})
