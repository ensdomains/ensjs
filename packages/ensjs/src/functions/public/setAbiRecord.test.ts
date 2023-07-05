import { Address, Hex } from 'viem'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../tests/addTestContracts'
import { encodeAbi } from '../../utils/encoders/encodeAbi'
import getAbiRecord from '../wallet/getAbiRecord'
import getResolver from '../wallet/getResolver'
import setAbiRecord from './setAbiRecord'

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
  const encodedAbi = await encodeAbi({ encodeAs: 'json', data: dummyABI })
  const tx = await setAbiRecord(walletClient, {
    name: 'test123.eth',
    encodedAbi,
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
  const encodedAbi = await encodeAbi({ encodeAs: 'zlib', data: dummyABI })
  const tx = await setAbiRecord(walletClient, {
    name: 'test123.eth',
    encodedAbi,
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
  const encodedAbi = await encodeAbi({ encodeAs: 'cbor', data: dummyABI })
  const tx = await setAbiRecord(walletClient, {
    name: 'test123.eth',
    encodedAbi,
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
  const encodedAbi = await encodeAbi({
    encodeAs: 'uri',
    data: 'https://example.com',
  })
  const tx = await setAbiRecord(walletClient, {
    name: 'test123.eth',
    encodedAbi,
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

it('should allow an abi record to be set to blank', async () => {
  const tx = await setAbiRecord(walletClient, {
    name: 'with-type-1-abi.eth',
    encodedAbi: null,
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
  expect(response).toBeNull()
})
