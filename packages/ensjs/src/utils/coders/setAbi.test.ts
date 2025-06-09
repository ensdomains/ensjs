import { describe, expect, it } from 'vitest'
import { setAbiParameters } from './setAbi.js'

describe('setAbiParameters', () => {
  const namehash =
    '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'

  it('returns correct parameters with null data', async () => {
    await expect(
      setAbiParameters({ namehash, data: null, encodeAs: 'json' }),
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
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          1n,
          "0x",
        ],
        "functionName": "setABI",
      }
    `)
  })

  it('returns correct parameters ', async () => {
    await expect(
      setAbiParameters({ namehash, data: { foo: 'bar' }, encodeAs: 'json' }),
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
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          1n,
          "0x7b22666f6f223a22626172227d",
        ],
        "functionName": "setABI",
      }
    `)
  })
})
