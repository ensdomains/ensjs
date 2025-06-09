import { encodeFunctionResult } from 'viem'
import { describe, expect, it } from 'vitest'
import {
  publicResolverMultiAddrSnippet,
  publicResolverSingleAddrSnippet,
} from '../../contracts/publicResolver.js'
import {
  decodeAddressResult,
  decodeAddressResultFromPrimitiveTypes,
  getAddressParameters,
} from './getAddress.js'

describe('getAddressParameters', () => {
  it('returns parameters for ETH address', () => {
    expect(getAddressParameters({ name: 'test.eth' })).toMatchInlineSnapshot(`
      {
        "abi": [
          {
            "inputs": [
              {
                "name": "node",
                "type": "bytes32",
              },
            ],
            "name": "addr",
            "outputs": [
              {
                "name": "",
                "type": "address",
              },
            ],
            "stateMutability": "view",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "node",
                "type": "bytes32",
              },
              {
                "name": "coinType",
                "type": "uint256",
              },
            ],
            "name": "addr",
            "outputs": [
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
        ],
        "functionName": "addr",
      }
    `)
  })

  it('returns parameters for non-ETH address', () => {
    expect(
      getAddressParameters({ name: 'test.eth', coin: 'btc' }),
    ).toMatchInlineSnapshot(`
      {
        "abi": [
          {
            "inputs": [
              {
                "name": "node",
                "type": "bytes32",
              },
            ],
            "name": "addr",
            "outputs": [
              {
                "name": "",
                "type": "address",
              },
            ],
            "stateMutability": "view",
            "type": "function",
          },
          {
            "inputs": [
              {
                "name": "node",
                "type": "bytes32",
              },
              {
                "name": "coinType",
                "type": "uint256",
              },
            ],
            "name": "addr",
            "outputs": [
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
          0n,
        ],
        "functionName": "addr",
      }
    `)
  })
})

describe('decodeAddressResultFromPrimitiveTypes', () => {
  it('returns ETH address', () => {
    const result = decodeAddressResultFromPrimitiveTypes({
      decodedData: '0x1234567890123456789012345678901234567890',
      coin: 60,
    })
    expect(result).toEqual({
      coinType: 60,
      symbol: 'eth',
      value: '0x1234567890123456789012345678901234567890',
    })
  })

  it('returns BTC address', () => {
    const result = decodeAddressResultFromPrimitiveTypes({
      decodedData: '0x76a91462e907b15cbf27d5425399ebf6f0fb50ebb88f1888ac',
      coin: 'btc',
    })
    expect(result).toEqual({
      coinType: 0,
      symbol: 'btc',
      value: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    })
  })

  it('returns null for empty data', () => {
    const result = decodeAddressResultFromPrimitiveTypes({
      decodedData: '0x',
      coin: 60,
    })
    expect(result).toBeNull()
  })
})

describe('decodeAddressResult', () => {
  it('decodes address result', () => {
    const encoded = encodeFunctionResult({
      abi: publicResolverSingleAddrSnippet,
      functionName: 'addr',
      result: '0x1234567890123456789012345678901234567890',
    })
    expect(
      decodeAddressResult(encoded, { coin: 60, strict: false }),
    ).toMatchInlineSnapshot(`
      {
        "coinType": 60,
        "symbol": "eth",
        "value": "0x1234567890123456789012345678901234567890",
      }
    `)
  })

  it('returns null when strict is false and decoding fails', () => {
    const encoded = '0x1234' // Invalid data
    expect(decodeAddressResult(encoded, { coin: 60, strict: false })).toBeNull()
  })

  it('throws when strict is true and decoding fails', () => {
    const encoded = '0x1234' // Invalid data
    expect(() =>
      decodeAddressResult(encoded, { coin: 60, strict: true }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [AbiDecodingDataSizeTooSmallError: Data size of 2 bytes is too small for given parameters.

      Params: (address)
      Data:   0x1234 (2 bytes)

      Version: 2.21.15]
    `)
  })

  it('decodes non-ETH address', async () => {
    const encoded = encodeFunctionResult({
      abi: publicResolverMultiAddrSnippet,
      functionName: 'addr',
      result: '0x76a91462e907b15cbf27d5425399ebf6f0fb50ebb88f1888ac',
    })
    expect(
      decodeAddressResult(encoded, { coin: 'btc', strict: false }),
    ).toMatchInlineSnapshot(`
      {
        "coinType": 0,
        "symbol": "btc",
        "value": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      }
    `)
  })
})
