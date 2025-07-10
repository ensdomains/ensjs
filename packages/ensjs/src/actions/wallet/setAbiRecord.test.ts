import type { Address, Hex } from 'viem'
import { afterEach, beforeAll, beforeEach, expect, it } from 'vitest'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../test/addTestContracts.js'
import type { AbiEncodeAs } from '../../utils/coders/encodeAbi.js'
import { setAbiParameters } from '../../utils/coders/setAbi.js'
import { getAbiRecord } from '../public/getAbiRecord.js'
import { getResolver } from '../public/getResolver.js'
import { setAbiRecord } from './setAbiRecord.js'

let snapshot: Hex
let accounts: Address[]

beforeAll(async () => {
  accounts = await walletClient.getAddresses()
})

beforeEach(async () => {
  snapshot = await testClient.snapshot()
})

afterEach(async () => {
  await testClient.revert({ id: snapshot })
})

const dummyABI = [
  {
    type: 'function',
    name: 'supportsInterface',
    constant: true,
    stateMutability: 'view',
    payable: false,
    inputs: [
      {
        type: 'bytes4',
      },
    ],
    outputs: [
      {
        type: 'bool',
      },
    ],
  },
]

it('should allow an abi record to be set with json content type', async () => {
  const tx = await setAbiRecord(walletClient, {
    name: 'test123.eth',
    data: dummyABI,
    encodeAs: 'json',
    resolverAddress: (await getResolver(publicClient, {
      name: 'test123.eth',
    }))!,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const response = await getAbiRecord(publicClient, {
    name: 'test123.eth',
  })
  expect(response!.abi).toEqual(dummyABI)
  expect(response!.contentType).toEqual(1)
  expect(response!.decoded).toBe(true)
})

it('should allow an abi record to be set with zlib content type', async () => {
  const tx = await setAbiRecord(walletClient, {
    name: 'test123.eth',
    data: dummyABI,
    encodeAs: 'zlib',
    resolverAddress: (await getResolver(publicClient, {
      name: 'test123.eth',
    }))!,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const response = await getAbiRecord(publicClient, {
    name: 'test123.eth',
  })
  expect(response!.abi).toEqual(dummyABI)
  expect(response!.contentType).toEqual(2)
  expect(response!.decoded).toBe(true)
})

it('should allow an abi record to be set with cbor content type', async () => {
  const tx = await setAbiRecord(walletClient, {
    name: 'test123.eth',
    data: dummyABI,
    encodeAs: 'cbor',
    resolverAddress: (await getResolver(publicClient, {
      name: 'test123.eth',
    }))!,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const response = await getAbiRecord(publicClient, {
    name: 'test123.eth',
  })
  expect(response!.abi).toEqual(dummyABI)
  expect(response!.contentType).toEqual(4)
  expect(response!.decoded).toBe(true)
})

it('should allow an abi record to be set with uri content type', async () => {
  const tx = await setAbiRecord(walletClient, {
    name: 'test123.eth',
    data: 'https://example.com',
    encodeAs: 'uri',
    resolverAddress: (await getResolver(publicClient, {
      name: 'test123.eth',
    }))!,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const response = await getAbiRecord(publicClient, {
    name: 'test123.eth',
  })
  expect(response!.abi).toEqual('https://example.com')
  expect(response!.contentType).toEqual(8)
  expect(response!.decoded).toBe(true)
})

it.each([
  ['json', 'with-type-1-abi.eth'],
  ['zlib', 'with-type-2-abi.eth'],
  ['cbor', 'with-type-4-abi.eth'],
  ['uri', 'with-type-8-abi.eth'],
] as [AbiEncodeAs, string][])(
  `should allow an abi record to be set to null with %s content type`,
  async (encodeAs, name) => {
    const tx = await setAbiRecord(walletClient, {
      name,
      data: null,
      encodeAs,
      resolverAddress: (await getResolver(publicClient, {
        name,
      }))!,
      account: accounts[1],
    })
    expect(tx).toBeTruthy()
    const receipt = await waitForTransaction(tx)
    expect(receipt.status).toBe('success')

    const response = await getAbiRecord(publicClient, {
      name,
    })
    expect(response).toBeNull()
  },
)

it('uses DedicatedResolver ABI when namehash is not specified', async () => {
  const result = await setAbiParameters({
    data: dummyABI,
    encodeAs: 'json',
  })

  expect(result).toMatchInlineSnapshot(`
    {
      "abi": [
        {
          "inputs": [
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
        1n,
        "0x5b7b2274797065223a2266756e6374696f6e222c226e616d65223a22737570706f727473496e74657266616365222c22636f6e7374616e74223a747275652c2273746174654d75746162696c697479223a2276696577222c2270617961626c65223a66616c73652c22696e70757473223a5b7b2274797065223a22627974657334227d5d2c226f757470757473223a5b7b2274797065223a22626f6f6c227d5d7d5d",
      ],
      "functionName": "setABI",
    }
  `)
})
