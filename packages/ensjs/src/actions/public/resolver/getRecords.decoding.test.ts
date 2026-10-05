import type { Hex } from 'viem'
import { describe, expect, it } from 'vitest'
import { runAbiDecode } from '../../../test/runAbiDecode.js'

describe('getRecords ABI failure handling', () => {
  it.each(['records-primitive', 'records-raw'] as const)(
    'preserves text records when ABI decoding fails through %s',
    (mode) => {
      for (const [contentType, data] of [
        ['1', '0x1234'],
        ['4', '0xbf'],
        ['4', '0x9affffffff'],
      ] as const satisfies readonly (readonly [string, Hex])[]) {
        expect(runAbiDecode({ mode, contentType, data })).toEqual({
          result: {
            resolverAddress: '0x1234567890123456789012345678901234567890',
            texts: [{ key: 'avatar', value: 'Avatar survives' }],
            abi: null,
          },
        })
      }
    },
    20000,
  )

  it.each(['records-primitive', 'records-raw'] as const)(
    'preserves valid ABI records through %s',
    (mode) => {
      expect(runAbiDecode({ mode, contentType: '4', data: '0x81a0' })).toEqual({
        result: {
          resolverAddress: '0x1234567890123456789012345678901234567890',
          texts: [{ key: 'avatar', value: 'Avatar survives' }],
          abi: { contentType: 4, decoded: true, abi: [{}] },
        },
      })
    },
    10000,
  )
})
