import type { Address } from 'viem'
import { describe, expect, it } from 'vitest'
import { setParentWriteParameters } from './setParent.js'

const registryAddress = '0x1111111111111111111111111111111111111111' as Address
const parentRegistryAddress =
  '0x2222222222222222222222222222222222222222' as Address
const client = {
  account: { address: '0x3333333333333333333333333333333333333333' },
  chain: { id: 1 },
} as unknown as Parameters<typeof setParentWriteParameters>[0]

describe('setParentWriteParameters', () => {
  it('calls setParent on the registry being named', () => {
    const params = setParentWriteParameters(client, {
      registryAddress,
      parentRegistryAddress,
      label: 'myname',
    })

    expect(params.address).toBe(registryAddress)
    expect(params.functionName).toBe('setParent')
    expect(params.args).toEqual([parentRegistryAddress, 'myname'])
  })
})
