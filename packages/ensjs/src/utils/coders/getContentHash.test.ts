import { encodeFunctionResult } from 'viem'
import { describe, expect, it } from 'vitest'
import { publicResolverContenthashSnippet } from '../../contracts/publicResolver.js'
import {
  decodeContentHashResult,
  decodeContentHashResultFromPrimitiveTypes,
  getContentHashParameters,
} from './getContentHash.js'

describe('getContenthashParameters', () => {
  it('returns parameters', () => {
    expect(
      getContentHashParameters({ name: 'test.eth' }),
    ).toMatchInlineSnapshot(`
      {
        "abi": [
          {
            "inputs": [
              {
                "internalType": "bytes32",
                "name": "node",
                "type": "bytes32",
              },
            ],
            "name": "contenthash",
            "outputs": [
              {
                "internalType": "bytes",
                "name": "",
                "type": "bytes",
              },
            ],
            "stateMutability": "view",
            "type": "function",
          },
        ],
        "args": [
          "0xeb4f647bea6caa36333c816d7b46fdcb05f9466ecacc140ea8c66faf15b3d9f1",
        ],
        "functionName": "contenthash",
      }
    `)
  })
})

describe('decodeContenthashResultFromPrimitiveTypes', () => {
  it('returns decoded IPFS hash', () => {
    const result = decodeContentHashResultFromPrimitiveTypes({
      decodedData:
        '0xe3010170122029f2d17be6139079dc48696d1f582a8530eb9805b561eda517e22a892c7e3f1f',
    })
    expect(result).toEqual({
      protocolType: 'ipfs',
      decoded: 'bafybeibj6lixxzqtsb45ysdjnupvqkufgdvzqbnvmhw2kf7cfkesy7r7d4',
    })
  })

  it('returns null for empty data', () => {
    const result = decodeContentHashResultFromPrimitiveTypes({
      decodedData: '0x',
    })
    expect(result).toBeNull()
  })
})

describe('decodeContenthashResult', () => {
  it('decodes contenthash result', () => {
    const encoded = encodeFunctionResult({
      abi: publicResolverContenthashSnippet,
      functionName: 'contenthash',
      result:
        '0xe3010170122029f2d17be6139079dc48696d1f582a8530eb9805b561eda517e22a892c7e3f1f',
    })
    expect(
      decodeContentHashResult(encoded, { strict: false }),
    ).toMatchInlineSnapshot(`
      {
        "decoded": "bafybeibj6lixxzqtsb45ysdjnupvqkufgdvzqbnvmhw2kf7cfkesy7r7d4",
        "protocolType": "ipfs",
      }
    `)
  })

  it('returns null when strict is false and decoding fails', () => {
    const encoded = '0x1234' // Invalid data
    expect(decodeContentHashResult(encoded, { strict: false })).toBeNull()
  })

  it('throws when strict is true and decoding fails', () => {
    const encoded = '0x1234' // Invalid data
    expect(() =>
      decodeContentHashResult(encoded, { strict: true }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [AbiDecodingDataSizeTooSmallError: Data size of 2 bytes is too small for given parameters.

      Params: (bytes)
      Data:   0x1234 (2 bytes)

      Version: 2.21.15]
    `)
  })
})
