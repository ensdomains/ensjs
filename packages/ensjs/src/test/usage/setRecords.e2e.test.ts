import type { Address, Hex } from 'viem'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../addTestContracts.js'
import { encodeAbi } from '../../utils/encoders/encodeAbi.js'
import getRecords from '../../functions/public/getRecords.js'
import getResolver from '../../functions/public/getResolver.js'
import setRecords from '../../functions/wallet/setRecords.js'
import getSubgraphRecords from '../../functions/subgraph/getSubgraphRecords.js'
import { commitAndRegisterName } from './helper.js'
import type { RegistrationParameters } from '../../utils/registerHelpers.js'

let snapshot: Hex
let accounts: Address[]
const secret = `0x${'a'.repeat(64)}` as Hex

beforeAll(async () => {
  accounts = await walletClient.getAddresses()
})

beforeEach(async () => {
  snapshot = await testClient.snapshot()
})

afterEach(async () => {
  await testClient.revert({ id: snapshot })
})
jest.setTimeout(30000)
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

it('should return a transaction to the resolver and update successfully', async () => {
  const name = `test${Math.floor(Math.random() * 1000000)}.eth`
  const params: RegistrationParameters = {
    name: name,
    duration: 31536000,
    owner: accounts[1],
    secret,
    resolverAddress: testClient.chain.contracts.ensPublicResolver.address,
  }
  await commitAndRegisterName(params, accounts[0])
  const tx = await setRecords(walletClient, {
    name: name,
    resolverAddress: (await getResolver(publicClient, {
      name: name,
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
    name: name,
    resolverAddress: (await getResolver(publicClient, {
      name: name,
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
    name: name,
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
    texts: [{ key: 'foo', value: 'bar' },{ key: 'bar', value: 'foo' }],
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
    coins: [{
      coin: 'etcLegacy',
      value: '',
    },],
    texts: [{ key: 'foo', value: '' }],
    abi: null,
    contentHash: null,
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
      abi: true,
      contentHash: true,
    },
  })
  console.log(records)
  expect(records.contentHash).toBeNull()
  // expect(records.abi!.abi).toMatchInlineSnapshot(`abi: { contentType: 1, decoded: true, abi: [ [Object] ] }`)
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
    coins: [
      {
        coin: 'etcLegacy',
        value: null,
      },
    ],
    texts: [{ key: 'foo', value: '' }],
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
      coins: ['61'],
      texts: ['foo'],
      abi: true,
      contentHash: true,
    },
  })
  console.log(records)
  expect(records.coins).toMatchInlineSnapshot(`[]`)
  expect(records.texts).toMatchInlineSnapshot(`[]`)
  expect(records.contentHash).not.toBeNull()
  expect(records.abi).not.toBeNull()
})
it.only('should return a transaction to the resolver and retrieve multiple keys successfully', async () => {
  //generate random name
  const name = `test${Math.floor(Math.random() * 1000000)}.eth`
  const params: RegistrationParameters = {
    name: name,
    duration: 31536000,
    owner: accounts[1],
    secret,
    resolverAddress: testClient.chain.contracts.ensPublicResolver.address,
  }
  await commitAndRegisterName(params, accounts[0])
  const tx = await setRecords(walletClient, {
    name: name,
    resolverAddress: (await getResolver(publicClient, {
      name: name,
    }))!,
    coins: [
      {
        coin: 'sol',
        value: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
      },
      {
        coin: 'eth',
        value: accounts[1],
      },
    ],
    texts: [{ key: 'name', value: 'e2e' }, { key: 'location', value: 'metaverse' }],
    abi: await encodeAbi({ encodeAs: 'json', data: dummyABI }),
    contentHash: 'ipfs://bafybeico3uuyj3vphxpvbowchdwjlrlrh62awxscrnii7w7flu5z6fk77y',
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')
  await testClient.mine({ blocks: 1 })
  //set a wait time here
  await new Promise((resolve) => setTimeout(resolve, 15000));
  const result = await getSubgraphRecords(publicClient, {
    name: name,
  })
  expect(result).toBeTruthy()

  const { createdAt, ...snapshot } = result!
  console.log(snapshot)
  expect(snapshot).toMatchInlineSnapshot(`
    {
      "coins": [
        "60",
        "501",
      ],
      "isMigrated": true,
      "texts": [
        "name",
        "location",
      ],
    }
  `)

  const utx = await setRecords(walletClient, {
    name: name,
    resolverAddress: (await getResolver(publicClient, {
      name: name,
    }))!,
    coins: [
      {
        coin: 'btc',
        value: '1PzAJcFtEiXo9UGtRU6iqXQKj8NXtcC7DE',
      },
    ],
    texts: [{ key: 'description', value: 'e2e' }],
    abi: undefined,
    contentHash: undefined,
    account: accounts[1],
  })

  expect(utx).toBeTruthy()
  const ureceipt = await waitForTransaction(utx)
  expect(ureceipt.status).toBe('success')

  //set a wait time here
  await new Promise((resolve) => setTimeout(resolve, 5000));
  const newResult = await getSubgraphRecords(publicClient, {
    name: name,
  })
  expect(result).toBeTruthy()

  console.log(newResult)

  const records = await getRecords(publicClient, {
    name: name,
    records: {
      coins: newResult!.coins,
      texts: newResult!.texts,
      contentHash: true,
      abi: true,
    },
  })
  console.log(records)
//   expect(records.contentHash).toMatchInlineSnapshot(`
//   {
//     "decoded": "k51qzi5uqu5dgox2z23r6e99oqency055a6xt92xzmyvpz8mwz5ycjavm0u150",
//     "protocolType": "ipns",
//   }
// `)
//   expect(records.abi!.abi).toStrictEqual([...dummyABI,{stateMutability: 'readonly',}])
//   expect(records.coins).toMatchInlineSnapshot(`
//     [
//       {
//         "id": 61,
//         "name": "etcLegacy",
//         "value": "${accounts[1]}",
//       },
//     ]
//   `)
//   expect(records.texts).toMatchInlineSnapshot(`
//     [
//       {
//         "key": "foo",
//         "value": "bars",
//       },
//     ]
//   `)
})