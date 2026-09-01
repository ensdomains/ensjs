import { describe, expect, it } from 'vitest'
import { setContentHashParameters } from './setContentHash.js'

describe('setContentHashParameters', () => {
  const name = 'test.eth'
  const contentHash = 'ipfs://QmXwMFNjzjRvZuPvzJfYJZ1QqX2QJjzj1YJZ1QqX2QJjzj'

  it('returns the correct parameters when contentHash is not null', () => {
    expect(
      setContentHashParameters({ name, contentHash }),
    ).toMatchInlineSnapshot(`
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
          "0xeb4f647bea6caa36333c816d7b46fdcb05f9466ecacc140ea8c66faf15b3d9f1",
          "0xe301017012208e9cc47fde7ff64028480ec671a4ddb8f767a71ff71a73247f51a495a6f29634",
        ],
        "functionName": "setContenthash",
      }
    `)
  })

  it('returns the correct parameters when contentHash is null', () => {
    expect(
      setContentHashParameters({ name, contentHash: null }),
    ).toMatchInlineSnapshot(`
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
          "0xeb4f647bea6caa36333c816d7b46fdcb05f9466ecacc140ea8c66faf15b3d9f1",
          "0x",
        ],
        "functionName": "setContenthash",
      }
    `)
  })

  it('throws an error when contentHash is invalid', () => {
    expect(() =>
      setContentHashParameters({
        name,
        contentHash: 'invalid-content-hash',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
        [InvalidContentHashError: Invalid content hash

        Version: @ensdomains/ensjs@1.0.0-mock.0]
      `)
  })
})
