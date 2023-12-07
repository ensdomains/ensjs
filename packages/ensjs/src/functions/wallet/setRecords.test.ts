import type { Address, Hex } from 'viem'
import { getVersion } from '../../errors/error-utils.js'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../test/addTestContracts.js'
import { encodeAbi } from '../../utils/encoders/encodeAbi.js'
import getRecords from '../public/getRecords.js'
import getResolver from '../public/getResolver.js'
import setRecords from './setRecords.js'

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

it('should return a transaction to the resolver and set successfully', async () => {
  const tx = await setRecords(walletClient, {
    name: 'test123.eth',
    resolverAddress: (await getResolver(publicClient, {
      name: 'test123.eth',
    }))!,
    coins: [
      {
        coin: 'etcLegacy',
        value: '0x42D63ae25990889E35F215bC95884039Ba354115',
      },
    ],
    texts: [{ key: 'foo', value: 'bar' }],
    abi: await encodeAbi({ encodeAs: 'json', data: dummyABI }),
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const records = await getRecords(publicClient, {
    name: 'test123.eth',
    records: {
      coins: ['etcLegacy'],
      texts: ['foo'],
      abi: true,
    },
  })
  expect(records.abi!.abi).toStrictEqual(dummyABI)
  expect(records.coins).toMatchInlineSnapshot(`
    [
      {
        "id": 61,
        "name": "etcLegacy",
        "value": "0x42D63ae25990889E35F215bC95884039Ba354115",
      },
    ]
  `)
  expect(records.texts).toMatchInlineSnapshot(`
    [
      {
        "key": "foo",
        "value": "bar",
      },
    ]
  `)
})
it('should error if there are no records to set', async () => {
  await expect(
    setRecords(walletClient, {
      name: 'test123.eth',
      resolverAddress: (await getResolver(publicClient, {
        name: 'test123.eth',
      }))!,

      account: accounts[1],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "No records specified

    Version: ${getVersion()}"
  `)
})
it('should not wrap with multicall if only setting a single record', async () => {
  const encodedData = setRecords.makeFunctionData(walletClient, {
    name: 'test123.eth',
    resolverAddress: (await getResolver(publicClient, {
      name: 'test123.eth',
    }))!,
    coins: [
      {
        coin: 'etcLegacy',
        value: '0x42D63ae25990889E35F215bC95884039Ba354115',
      },
    ],
  })
  // 0x8b95dd71 is the function selector for setAddr(bytes32,uint256,bytes)
  expect(encodedData.data.startsWith('0x8b95dd71')).toBe(true)
})
it('should return a transaction to the resolver and update successfully', async () => {
  const tx = await setRecords(walletClient, {
    name: 'test123.eth',
    resolverAddress: (await getResolver(publicClient, {
      name: 'test123.eth',
    }))!,
    coins: [
      {
        coin: 'etcLegacy',
        value: '0x42D63ae25990889E35F215bC95884039Ba354115',
      },
    ],
    texts: [{ key: 'foo', value: 'bar' }],
    abi: await encodeAbi({ encodeAs: 'json', data: dummyABI }),
    contentHash: 'ipfs://bafybeico3uuyj3vphxpvbowchdwjlrlrh62awxscrnii7w7flu5z6fk77y',
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')
  await testClient.mine({ blocks: 1 })


  const utx = await setRecords(walletClient, {
    name: 'test123.eth',
    resolverAddress: (await getResolver(publicClient, {
      name: 'test123.eth',
    }))!,
    coins: [
      {
        coin: 'etcLegacy',
        value: accounts[1],
      },
    ],
    texts: [{ key: 'foo', value: 'bars' }],
    abi: await encodeAbi({ encodeAs: 'json', data: [...dummyABI,{stateMutability: 'readonly',}] }),
    contentHash: 'ipns://k51qzi5uqu5dgox2z23r6e99oqency055a6xt92xzmyvpz8mwz5ycjavm0u150',
    account: accounts[1],
  })
  expect(utx).toBeTruthy()
  const ureceipt = await waitForTransaction(utx)
  expect(ureceipt.status).toBe('success')

  const records = await getRecords(publicClient, {
    name: 'test123.eth',
    records: {
      coins: ['etcLegacy'],
      texts: ['foo'],
      contentHash: true,
      abi: true,
    },
  })
  expect(records.contentHash).toMatchInlineSnapshot(`
  {
    "decoded": "k51qzi5uqu5dgox2z23r6e99oqency055a6xt92xzmyvpz8mwz5ycjavm0u150",
    "protocolType": "ipns",
  }
`)
  expect(records.abi!.abi).toStrictEqual([...dummyABI,{stateMutability: 'readonly',}])
  expect(records.coins).toMatchInlineSnapshot(`
    [
      {
        "id": 61,
        "name": "etcLegacy",
        "value": "${accounts[1]}",
      },
    ]
  `)
  expect(records.texts).toMatchInlineSnapshot(`
    [
      {
        "key": "foo",
        "value": "bars",
      },
    ]
  `)
})
it('should return a transaction to the resolver and remove successfully', async () => {
  const tx = await setRecords(walletClient, {
    name: 'test123.eth',
    resolverAddress: (await getResolver(publicClient, {
      name: 'test123.eth',
    }))!,
    coins: [
      {
        coin: 'etcLegacy',
        value: '0x42D63ae25990889E35F215bC95884039Ba354115',
      },
    ],
    texts: [{ key: 'foo', value: 'bar' }],
    abi: await encodeAbi({ encodeAs: 'json', data: dummyABI }),
    contentHash: 'ipfs://bafybeico3uuyj3vphxpvbowchdwjlrlrh62awxscrnii7w7flu5z6fk77y',
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')
  await testClient.mine({ blocks: 1 })


  const utx = await setRecords(walletClient, {
    name: 'test123.eth',
    resolverAddress: (await getResolver(publicClient, {
      name: 'test123.eth',
    }))!,
    coins: [],
    texts: [],
    abi: null,
    account: accounts[1],
  })
  expect(utx).toBeTruthy()
  const ureceipt = await waitForTransaction(utx)
  expect(ureceipt.status).toBe('success')

  const records = await getRecords(publicClient, {
    name: 'test123.eth',
    records: {
      coins: [],
      texts: [],
      abi: true,
      contentHash: true,
    },
  })
  expect(records.abi!.abi).toMatchInlineSnapshot(`abi: { contentType: 1, decoded: true, abi: [ [Object] ] }`)
  expect(records.coins).toMatchInlineSnapshot(`[]`)
  expect(records.texts).toMatchInlineSnapshot(`[]`)
})
it('should return a transaction to the resolver and ignore undefined', async () => {
  const tx = await setRecords(walletClient, {
    name: 'test123.eth',
    resolverAddress: (await getResolver(publicClient, {
      name: 'test123.eth',
    }))!,
    coins: [
      {
        coin: 'etcLegacy',
        value: '0x42D63ae25990889E35F215bC95884039Ba354115',
      },
    ],
    texts: [{ key: 'foo', value: 'bar' }],
    abi: await encodeAbi({ encodeAs: 'json', data: dummyABI }),
    contentHash: 'ipfs://bafybeico3uuyj3vphxpvbowchdwjlrlrh62awxscrnii7w7flu5z6fk77y',
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')
  await testClient.mine({ blocks: 1 })


  const utx = await setRecords(walletClient, {
    name: 'test123.eth',
    resolverAddress: (await getResolver(publicClient, {
      name: 'test123.eth',
    }))!,
    coins: [],
    texts: [],
    abi: undefined,
    contentHash: undefined,
    account: accounts[1],
  })
  expect(utx).toBeTruthy()
  const ureceipt = await waitForTransaction(utx)
  expect(ureceipt.status).toBe('success')

  const records = await getRecords(publicClient, {
    name: 'test123.eth',
    records: {
      coins: [],
      texts: [],
      abi: true,
      contentHash: true,
    },
  })
  expect(records.abi).toMatchInlineSnapshot(`undefined`)
  expect(records.coins).toMatchInlineSnapshot(`[]`)
  expect(records.texts).toMatchInlineSnapshot(`[]`)
})