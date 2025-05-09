import { describe, expect, it } from 'vitest'
import { setContentHashParameters } from './setContentHash.js'

describe('setContentHashParameters', () => {
  const namehash =
    '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  const contentHash = 'ipfs://QmXwMFNjzjRvZuPvzJfYJZ1QqX2QJjzj1YJZ1QqX2QJjzj'

  it('returns the correct parameters when contentHash is not null', () => {
    expect(setContentHashParameters({ namehash, contentHash }))
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
                "name": "hash",
                "type": "bytes",
              },
            ],
            "name": "setContenthash",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
        ],
        "args": [
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          "0xe301017012208e9cc47fde7ff64028480ec671a4ddb8f767a71ff71a73247f51a495a6f29634",
        ],
        "functionName": "setContenthash",
      }
    `)
  })

  it('returns the correct parameters when contentHash is null', () => {
    expect(setContentHashParameters({ namehash, contentHash: null }))
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
                "name": "hash",
                "type": "bytes",
              },
            ],
            "name": "setContenthash",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function",
          },
        ],
        "args": [
          "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          "0x",
        ],
        "functionName": "setContenthash",
      }
    `)
  })

  it('throws an error when contentHash is invalid', () => {
    expect(() =>
      setContentHashParameters({
        namehash,
        contentHash: 'invalid-content-hash',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidContentHashError: Invalid content hash

        Version: @ensdomains/ensjs@1.0.0-mock.0]
      `)
  })
})
