import { assert, describe, expect, it } from 'vitest'
import { publicClient } from '../../test/addTestContracts.js'
import { getWrapperData } from './v1/getWrapperData.js'

describe('getWrapperData', () => {
  it('should return null for an unwrapped name', async () => {
    const result = await getWrapperData(publicClient, {
      name: 'with-profile.eth',
    })
    expect(result).toBeNull()
  })
  it('should return with CAN_DO_EVERYTHING set to true for a name with no fuses burned', async () => {
    const result = await getWrapperData(publicClient, {
      name: 'test.wrapped-with-subnames.eth',
    })
    assert.isNotNull(result)
    expect(result.fuses.child.CAN_DO_EVERYTHING).toBe(true)
    expect(result.fuses.value).toBe(0)
  })
  // it('should return with other correct fuses', async () => {
  //   const tx = await ensInstance.setFuses('wrapped.eth', {
  //     named: [
  //       'CANNOT_UNWRAP',
  //       'CANNOT_CREATE_SUBDOMAIN',
  //       'CANNOT_SET_TTL',
  //       'CANNOT_APPROVE',
  //     ],
  //     addressOrIndex: 1,
  //   })
  //   await tx.wait()

  //   const result = await ensInstance.getWrapperData('wrapped.eth')
  //   expect(result).toBeTruthy()
  //   if (result) {
  //     expect(result.child.CAN_DO_EVERYTHING).toBe(false)
  //     expect(result.child.CANNOT_UNWRAP).toBe(true)
  //     expect(result.child.CANNOT_CREATE_SUBDOMAIN).toBe(true)
  //     expect(result.child.CANNOT_SET_TTL).toBe(true)
  //     expect(result.child.CANNOT_APPROVE).toBe(true)
  //     expect(result.parent.IS_DOT_ETH).toBe(true)
  //   }
  // })
  it('should return correct expiry', async () => {
    const result = await getWrapperData(publicClient, {
      name: 'wrapped.eth',
    })
    expect(result).toBeTruthy()
    assert.isNotNull(result)
    expect(result.expiry).toBeTypeOf('bigint')
  })
  it('should return correct expiry for large expiry', async () => {
    const result = await getWrapperData(publicClient, {
      name: 'wrapped-big-duration.eth',
    })
    assert.isNotNull(result)
    expect(result.expiry).toBeTypeOf('bigint')
  })
})
