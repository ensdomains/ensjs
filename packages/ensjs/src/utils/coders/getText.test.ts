import { encodeFunctionResult } from 'viem'
import { describe, expect, it } from 'vitest'
import { publicResolverTextSnippet } from '../../contracts/publicResolver.js'
import {
  decodeTextResult,
  decodeTextResultFromPrimitiveTypes,
  getTextParameters,
} from './getText.js'

describe('getTextParameters', () => {
  it('returns parameters', () => {
    expect(getTextParameters({ name: 'test.eth', key: 'email' }))
      .toMatchInlineSnapshot(`
      {
        "abi": [
          {
            "inputs": [
              {
                "name": "node",
                "type": "bytes32",
              },
              {
                "name": "key",
                "type": "string",
              },
            ],
            "name": "text",
            "outputs": [
              {
                "name": "",
                "type": "string",
              },
            ],
            "stateMutability": "view",
            "type": "function",
          },
        ],
        "args": [
          "0xeb4f647bea6caa36333c816d7b46fdcb05f9466ecacc140ea8c66faf15b3d9f1",
          "email",
        ],
        "functionName": "text",
      }
    `)
  })
})

describe('decodeTextResultFromPrimitiveTypes', () => {
  it('returns decoded text', () => {
    const result = decodeTextResultFromPrimitiveTypes({
      decodedData: 'example@example.com',
    })
    expect(result).toBe('example@example.com')
  })

  it('returns null for empty data', () => {
    const result = decodeTextResultFromPrimitiveTypes({
      decodedData: '',
    })
    expect(result).toBeNull()
  })
})

describe('decodeTextResult', () => {
  it('decodes text result', () => {
    const encoded = encodeFunctionResult({
      abi: publicResolverTextSnippet,
      functionName: 'text',
      result: 'example@example.com',
    })
    expect(decodeTextResult(encoded, { strict: false })).toBe(
      'example@example.com',
    )
  })

  it('returns null when strict is false and decoding fails', () => {
    const encoded = '0x1234' // Invalid data
    expect(decodeTextResult(encoded, { strict: false })).toBeNull()
  })

  it('throws when strict is true and decoding fails', () => {
    const encoded = '0x1234' // Invalid data
    expect(() => decodeTextResult(encoded, { strict: true }))
      .toThrowErrorMatchingInlineSnapshot(`
      [AbiDecodingDataSizeTooSmallError: Data size of 2 bytes is too small for given parameters.

      Params: (string)
      Data:   0x1234 (2 bytes)

      Version: 2.21.15]
    `)
  })
})
