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
          "0xeb4f647bea6caa36333c816d7b46fdcb05f9466ecacc140ea8c66faf15b3d9f1",
          "email",
          "test@example.com",
        ],
        "functionName": "setText",
      }
    `)
  })
})
