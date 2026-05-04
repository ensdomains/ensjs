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
            "0xeb4f647bea6caa36333c816d7b46fdcb05f9466ecacc140ea8c66faf15b3d9f1",
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
            "0xeb4f647bea6caa36333c816d7b46fdcb05f9466ecacc140ea8c66faf15b3d9f1",
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
            "0xeb4f647bea6caa36333c816d7b46fdcb05f9466ecacc140ea8c66faf15b3d9f1",
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
            "0xeb4f647bea6caa36333c816d7b46fdcb05f9466ecacc140ea8c66faf15b3d9f1",
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
            "0xeb4f647bea6caa36333c816d7b46fdcb05f9466ecacc140ea8c66faf15b3d9f1",
            60n,
            "0x0000000000000000000000000000000000000000",
          ],
          "functionName": "setAddr",
        }
      `)
    })
  })
})
