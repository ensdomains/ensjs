import { encodeFunctionResult, stringToHex } from 'viem'
import { describe, expect, it } from 'vitest'
import { publicResolverAbiSnippet } from '../../contracts/publicResolver.js'
import {
  decodeAbiResult,
  decodeAbiResultFromPrimitiveTypes,
  getAbiParameters,
} from './getAbi.js'

describe('getAbiParameters', () => {
  it('returns parameters', () => {
    expect(getAbiParameters({ name: 'test.eth' })).toMatchInlineSnapshot(`
      {
        "abi": [
          {
            "inputs": [
              {
                "name": "node",
                "type": "bytes32",
              },
              {
                "name": "contentTypes",
                "type": "uint256",
              },
            ],
            "name": "ABI",
            "outputs": [
              {
                "name": "",
                "type": "uint256",
              },
              {
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
          15n,
        ],
        "functionName": "ABI",
      }
    `)
  })
  it('allows content type override', () => {
    expect(
      getAbiParameters({ name: 'test.eth', supportedContentTypes: 0x1n }),
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
                "name": "contentTypes",
                "type": "uint256",
              },
            ],
            "name": "ABI",
            "outputs": [
              {
                "name": "",
                "type": "uint256",
              },
              {
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
          1n,
        ],
        "functionName": "ABI",
      }
    `)
  })
})
describe('decodeAbiResultFromPrimitiveTypes', () => {
  it('returns object', async () => {
    await expect(
      decodeAbiResultFromPrimitiveTypes({
        decodedData: [8n, stringToHex('https://example.com')],
      }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "abi": "https://example.com",
        "contentType": 8,
        "decoded": true,
      }
    `)
  })
  it('returns null data when content type is 0', async () => {
    await expect(
      decodeAbiResultFromPrimitiveTypes({ decodedData: [0n, '0x1234'] }),
    ).resolves.toBeNull()
  })
  it('returns null data when abi data is 0x', async () => {
    await expect(
      decodeAbiResultFromPrimitiveTypes({ decodedData: [1n, '0x'] }),
    ).resolves.toBeNull()
  })
})
describe('decodeAbiResult', () => {
  it('decodes abi result', async () => {
    const encoded = encodeFunctionResult({
      abi: publicResolverAbiSnippet,
      functionName: 'ABI',
      result: [8n, stringToHex('https://example.com')],
    })
    await expect(
      decodeAbiResult(encoded, { strict: false }),
    ).resolves.toMatchInlineSnapshot(`
      {
        "abi": "https://example.com",
        "contentType": 8,
        "decoded": true,
      }
    `)
  })
  it('returns null when strict is false and decoding fails', async () => {
    const encoded = encodeFunctionResult({
      abi: publicResolverAbiSnippet,
      functionName: 'ABI',
      result: [1n, '0x1234'],
    })
    await expect(
      decodeAbiResult(encoded, { strict: false }),
    ).resolves.toBeNull()
  })
  it('throws when strict is true and decoding fails', async () => {
    const encoded = encodeFunctionResult({
      abi: publicResolverAbiSnippet,
      functionName: 'ABI',
      result: [1n, '0x1234'],
    })
    await expect(
      decodeAbiResult(encoded, { strict: true }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[SyntaxError: Unexpected token '', "4" is not valid JSON]`,
    )
  })
})
