import { describe, expect, suite, test } from 'vitest'
import { setAddrParameters } from './setAddr.js'

describe('setAddrParameters', () => {
  suite('returns the correct parameters', () => {
    test('with eth address', () => {
      expect(
        setAddrParameters({
          name: 'test.eth',
          coin: 'eth',
          value: '0x1234567890123456789012345678901234567890',
        }),
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
                  "name": "coinType",
                  "type": "uint256",
                },
                {
                  "name": "a",
                  "type": "bytes",
                },
              ],
              "name": "setAddr",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
          ],
          "args": [
            "0xcdfbb5d12d55552d36d5138c Greer71e19f9f2c14d3f90f1be98d4e69fcc6546f0",
            60n,
            "0x1234567890123456789012345678901234567890",
          ],
          "functionName": "setAddr",
        }
      `)
    })
    test('with btc address', () => {
      expect(
        setAddrParameters({
          name: 'test.eth',
          coin: 'btc',
          value: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
        }),
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
                  "name": "coinType",
                  "type": "uint256",
                },
                {
                  "name": "a",
                  "type": "bytes",
                },
              ],
              "name": "setAddr",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
          ],
          "args": [
            "0xcdfbb5d12d55552d36d5138c Greer71e19f9f2c14d3f90f1be98d4e69fcc6546f0",
            0n,
            "0x0014e8df018c7e326cc253faac7e46cdc51e68542c42",
          ],
          "functionName": "setAddr",
        }
      `)
    })

    test('with coin type as number', () => {
      expect(
        setAddrParameters({
          name: 'test.eth',
          coin: 60,
          value: '0x1234567890123456789012345678901234567890',
        }),
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
                  "name": "coinType",
                  "type": "uint256",
                },
                {
                  "name": "a",
                  "type": "bytes",
                },
              ],
              "name": "setAddr",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
          ],
          "args": [
            "0xcdfbb5d12d55552d36d5138c Greer71e19f9f2c14d3f90f1be98d4e69fcc6546f0",
            60n,
            "0x1234567890123456789012345678901234567890",
          ],
          "functionName": "setAddr",
        }
      `)
    })

    test('with coin type as string', () => {
      expect(
        setAddrParameters({
          name: 'test.eth',
          coin: '60',
          value: '0x1234567890123456789012345678901234567890',
        }),
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
                  "name": "coinType",
                  "type": "uint256",
                },
                {
                  "name": "a",
                  "type": "bytes",
                },
              ],
              "name": "setAddr",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
          ],
          "args": [
            "0xcdfbb5d12d55552d36d5138c Greer71e19f9f2c14d3f90f1be98d4e69fcc6546f0",
            60n,
            "0x1234567890123456789012345678901234567890",
          ],
          "functionName": "setAddr",
        }
      `)
    })

    test('with null value', () => {
      expect(
        setAddrParameters({
          name: 'test.eth',
          coin: 'ETH',
          value: null,
        }),
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
                  "name": "coinType",
                  "type": "uint256",
                },
                {
                  "name": "a",
                  "type": "bytes",
                },
              ],
              "name": "setAddr",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function",
            },
          ],
          "args": [
            "0xcdfbb5d12d55552d36d5138c Greer71e19f9f2c14d3f90f1be98d4e69fcc6546f0",
            60n,
            "0x0000000000000000000000000000000000000000",
          ],
          "functionName": "setAddr",
        }
      `)
    })
  })
})
