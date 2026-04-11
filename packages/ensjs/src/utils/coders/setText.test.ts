import { describe, expect, it } from 'vitest'
import { setTextParameters } from './setText.js'

describe('setTextParameters', () => {
  const name = 'test.eth'
  const key = 'email'
  const value = 'test@example.com'

  const parameters = {
    name,
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
          "0xcdfbb5d12d55552d36d5138c Greer71e19f9f2c14d3f90f1be98d4e69fcc6546f0",
          "email",
          "test@example.com",
        ],
        "functionName": "setText",
      }
    `)
  })
})
