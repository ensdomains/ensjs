import { describe, expect, it } from 'vitest'
import { setTextParameters } from './setText.js'

describe('setTextParameters', () => {
  const namehash =
    '0x1234567890123456789012345678901234567890123456789012345678901234'
  const key = 'email'
  const value = 'test@example.com'

  const parameters = {
    namehash,
    key,
    value,
  } as const

  it('returns the correct parameters', () => {
    const result = setTextParameters(parameters)
    expect(result).toMatchInlineSnapshot(`
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
              {
                "name": "value",
                "type": "string",
              },
            ],
            "name": "setText",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
        ],
        "args": [
          "0x1234567890123456789012345678901234567890123456789012345678901234",
          "email",
          "test@example.com",
        ],
        "functionName": "setText",
      }
    `)
  })
})
