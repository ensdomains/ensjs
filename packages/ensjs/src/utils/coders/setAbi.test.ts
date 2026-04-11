import { describe, expect, it } from 'vitest'
import { setAbiParameters } from './setAbi.js'

describe('setAbiParameters', () => {
  const name = 'test.eth'

  it('returns correct parameters with null data', async () => {
    await expect(
      setAbiParameters({ name, data: null, encodeAs: 'json' }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "abi": [
          {
            "inputs": [
              {
                "name": "node",
                "type": "bytes32",
              },
              {
                "name": "contentType",
                "type": "uint256",
              },
              {
                "name": "data",
                "type": "bytes",
              },
            ],
            "name": "setABI",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
        ],
        "args": [
          "0xcdfbb5d12d55552d36d5138c Greer71e19f9f2c14d3f90f1be98d4e69fcc6546f0",
          1n,
          "0x",
        ],
        "functionName": "setABI",
      }
    `)
  })

  it('returns correct parameters ', async () => {
    await expect(
      setAbiParameters({ name, data: { foo: 'bar' }, encodeAs: 'json' }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "abi": [
          {
            "inputs": [
              {
                "name": "node",
                "type": "bytes32",
              },
              {
                "name": "contentType",
                "type": "uint256",
              },
              {
                "name": "data",
                "type": "bytes",
              },
            ],
            "name": "setABI",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
        ],
        "args": [
          "0xcdfbb5d12d55552d36d5138c Greer71e19f9f2c14d3f90f1be98d4e69fcc6546f0",
          1n,
          "0x7b22666f6f223a22626172227d",
        ],
        "functionName": "setABI",
      }
    `)
  })
})
