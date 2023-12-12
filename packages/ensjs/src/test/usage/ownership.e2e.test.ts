import { type Address, type Hex } from 'viem'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../test/addTestContracts.js'
import type { RegistrationParameters } from '../../utils/registerHelpers.js'
import setAddressRecord from '../../functions/wallet/setAddressRecord.js'
import getResolver from '../../functions/public/getResolver.js'
import getOwner from '../../functions/public/getOwner.js'
import unwrapName from '../../functions/wallet/unwrapName.js'
import transferName from '../../functions/wallet/transferName.js'
import createSubname from '../../functions/wallet/createSubname.js'
import { encodeAbi } from '../../utils/index.js'
import setRecords from '../../functions/wallet/setRecords.js'
import { commitAndRegisterName } from './helper.js'

let snapshot: Hex
let accounts: Address[]

beforeAll(async () => {
  accounts = await walletClient.getAddresses()
  console.log(accounts[1])
  console.log(accounts[2])
})

beforeEach(async () => {
  snapshot = await testClient.snapshot()
})

afterEach(async () => {
  await testClient.revert({ id: snapshot })
})

const secret = `0x${'a'.repeat(64)}` as Hex

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

it('Register - unwrapped 2LD', async () => {
  const name = 'cool-swag-wrap.eth'
  const params: RegistrationParameters = {
    name: name,
    duration: 31536000,
    owner: accounts[1],
    secret,
    resolverAddress: testClient.chain.contracts.ensPublicResolver.address,
  }
  await commitAndRegisterName(params, accounts[1])

  const unwrapNameTx = await unwrapName(walletClient, {
    name: name,
    newOwnerAddress: accounts[1],
    newRegistrantAddress: accounts[1],
    account: accounts[1],
  })
  expect(unwrapNameTx).toBeTruthy()
  const unwrapNameTxReceipt = await waitForTransaction(unwrapNameTx)
  expect(unwrapNameTxReceipt.status).toBe('success')

  const nameOwner = await getOwner(publicClient, {
    name: name,
  })
  expect(nameOwner!.owner).toBe(accounts[1])
  expect(nameOwner!.registrant).toBe(accounts[1])
  expect(nameOwner!.ownershipLevel).toBe('registrar')


  const resolver = await getResolver(publicClient, { name: name })

  const setAddressRecordTx = await setAddressRecord(walletClient, {
    name: name,
    coin: 'eth',
    value: accounts[2],
    resolverAddress: resolver as Address,
    account: accounts[1],
  })
  expect(setAddressRecordTx).toBeTruthy()
  const setAddressRecordTxReceipt = await waitForTransaction(setAddressRecordTx)
  expect(setAddressRecordTxReceipt.status).toBe('success')

  const transferMgrTx = await transferName(walletClient, {
    name: name,
    newOwnerAddress: accounts[2],
    contract: 'registrar',
    account: accounts[1],
  })
  expect(transferMgrTx).toBeTruthy()
  const transferMgrTxReceipt = await waitForTransaction(transferMgrTx)
  expect(transferMgrTxReceipt.status).toBe('success')

  const transferOwnerTx = await transferName(walletClient, {
    name: name,
    newOwnerAddress: accounts[2],
    contract: 'registry',
    account: accounts[1],
  })
  expect(transferOwnerTx).toBeTruthy()
  const transferOwnerTxReceipt = await waitForTransaction(transferOwnerTx)
  expect(transferOwnerTxReceipt.status).toBe('success')
  
})

it('Register - wrapped 2LD', async () => {``
  const name = 'cool-swag-wrap.eth'
  const params: RegistrationParameters = {
    name: name,
    duration: 31536000,
    owner: accounts[1],
    secret,
    resolverAddress: testClient.chain.contracts.ensPublicResolver.address,
    records: {
      coins: [
        {
          coin: 'etcLegacy',
          value: accounts[1],
        },
        {
          coin: 'btc',
          value: '1PzAJcFtEiXo9UGtRU6iqXQKj8NXtcC7DE',
        },
        {
          coin: 'sol',
          value: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
        }
      ],
      texts: [{ key: 'foo', value: 'bar' }],
      abi: await encodeAbi({ encodeAs: 'json', data: dummyABI }),
      contentHash: 'ipns://k51qzi5uqu5dgox2z23r6e99oqency055a6xt92xzmyvpz8mwz5ycjavm0u150'
    }
  }
  await commitAndRegisterName(params, accounts[1])

  const nameOwner = await getOwner(publicClient, {
    name: name,
  })
  expect(nameOwner!.owner).toBe(accounts[1])
  // expect(nameOwner!.registrant).toBe(accounts[1])
  expect(nameOwner!.ownershipLevel).toBe('nameWrapper')


  const resolver = await getResolver(publicClient, { name: name })

  const setAddressRecordTx = await setAddressRecord(walletClient, {
    name: name,
    coin: 'eth',
    value: accounts[2],
    resolverAddress: resolver as Address,
    account: accounts[1],
  })
  expect(setAddressRecordTx).toBeTruthy()
  const setAddressRecordTxReceipt = await waitForTransaction(setAddressRecordTx)
  expect(setAddressRecordTxReceipt.status).toBe('success')

  const tx = await setRecords(walletClient, {
    name: name,
    resolverAddress: (await getResolver(publicClient, {
      name: name,
    }))!,
    clearRecords: true,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const transferMgrTx = await transferName(walletClient, {
    name: name,
    newOwnerAddress: accounts[2],
    contract: 'nameWrapper',
    account: accounts[1],
  })
  expect(transferMgrTx).toBeTruthy()
  const transferMgrTxReceipt = await waitForTransaction(transferMgrTx)
  expect(transferMgrTxReceipt.status).toBe('success')
})

it('Register - unwrapped 2LD - unwrapped subname', async () => {``
  const name = 'cool-swag-wrap.eth'
  const subname = 'subname.cool-swag-wrap.eth'
  const params: RegistrationParameters = {
    name: name,
    duration: 31536000,
    owner: accounts[1],
    secret,
    resolverAddress: testClient.chain.contracts.ensPublicResolver.address,
    records: {
      coins: [
        {
          coin: 'etcLegacy',
          value: accounts[1],
        },
        {
          coin: 'btc',
          value: '1PzAJcFtEiXo9UGtRU6iqXQKj8NXtcC7DE',
        },
        {
          coin: 'sol',
          value: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
        }
      ],
      texts: [{ key: 'foo', value: 'bar' }],
      abi: await encodeAbi({ encodeAs: 'json', data: dummyABI }),
      contentHash: 'ipns://k51qzi5uqu5dgox2z23r6e99oqency055a6xt92xzmyvpz8mwz5ycjavm0u150'
    }
  }
  await commitAndRegisterName(params, accounts[1])

  const nameOwner = await getOwner(publicClient, {
    name: name,
  })
  expect(nameOwner!.owner).toBe(accounts[1])
  // expect(nameOwner!.registrant).toBe(accounts[1])
  expect(nameOwner!.ownershipLevel).toBe('nameWrapper')
  const resolver = await getResolver(publicClient, { name: name })

  const unwrapNameTx = await unwrapName(walletClient, {
    name: name,
    newOwnerAddress: accounts[1],
    newRegistrantAddress: accounts[1],
    account: accounts[1],
  })
  expect(unwrapNameTx).toBeTruthy()
  const unwrapNameTxReceipt = await waitForTransaction(unwrapNameTx)
  expect(unwrapNameTxReceipt.status).toBe('success')

  //get resolver
  const resolverAddress = await getResolver(publicClient, { name: name })

  //add subname
  const createSubnameTx = await createSubname(walletClient, {
    name: subname,
    contract: 'registry',
    owner: accounts[2],
    account: accounts[1],
    resolverAddress: resolverAddress as Address,
  })

  expect(createSubnameTx).toBeTruthy()
  const createSubnameTxReceipt = await waitForTransaction(createSubnameTx)
  expect(createSubnameTxReceipt.status).toBe('success')

  const setRecordsTx = await setRecords(walletClient, {
    name: subname,
    resolverAddress: resolverAddress as Address,
    coins: [
      {
        coin: 'etcLegacy',
        value: accounts[1],
      },
      {
        coin: 'btc',
        value: '1PzAJcFtEiXo9UGtRU6iqXQKj8NXtcC7DE',
      },
      {
        coin: 'sol',
        value: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
      }
    ],
    texts: [{ key: 'foo', value: 'bar' }],
    abi: await encodeAbi({ encodeAs: 'json', data: dummyABI }),
    contentHash: 'ipns://k51qzi5uqu5dgox2z23r6e99oqency055a6xt92xzmyvpz8mwz5ycjavm0u150',
    account: accounts[2],
  })
  const setRecordsTxReceipt = await waitForTransaction(setRecordsTx)
  expect(setRecordsTxReceipt.status).toBe('success')

  const setAddressRecordTx = await setAddressRecord(walletClient, {
    name:subname,
    coin: 'eth',
    value: accounts[1],
    resolverAddress: resolver as Address,
    account: accounts[2],
  })
  expect(setAddressRecordTx).toBeTruthy()
  const setAddressRecordTxReceipt = await waitForTransaction(setAddressRecordTx)
  expect(setAddressRecordTxReceipt.status).toBe('success')

  const transferMgrTx = await transferName(walletClient, {
    name: subname,
    newOwnerAddress: accounts[3],
    contract: 'registry',
    account: accounts[2],
  })
  expect(transferMgrTx).toBeTruthy()
  const transferMgrTxReceipt = await waitForTransaction(transferMgrTx)
  expect(transferMgrTxReceipt.status).toBe('success')

  const transferMgrAsParentTx = await transferName(walletClient, {
    name: subname,
    newOwnerAddress: accounts[2],
    contract: 'registry',
    account: accounts[1],
    asParent: true,
  })
  expect(transferMgrAsParentTx).toBeTruthy()
  const transferMgrAsParentTxReceipt = await waitForTransaction(transferMgrAsParentTx)
  expect(transferMgrAsParentTxReceipt.status).toBe('success')
})

it('Register - wrapped 2LD - wrapped 3LD', async () => {
  const name = 'cool-swag-wrap.eth'
  const params: RegistrationParameters = {
    name: name,
    duration: 31536000,
    owner: accounts[1],
    secret,
    resolverAddress: testClient.chain.contracts.ensPublicResolver.address,
  }
  await commitAndRegisterName(params, accounts[1])

 //create subname
  const subname = 'subname.cool-swag-wrap.eth'
  const createSubnameTx = await createSubname(walletClient, {
    name: subname,
    contract: 'nameWrapper',
    owner: accounts[2],
    account: accounts[1],
  })

  expect(createSubnameTx).toBeTruthy()
  const createSubnameTxReceipt = await waitForTransaction(createSubnameTx)
  expect(createSubnameTxReceipt.status).toBe('success')

  const resolver = await getResolver(publicClient, { name: name })

  const setAddressRecordTx = await setAddressRecord(walletClient, {
    name: subname,
    coin: 'eth',
    value: accounts[3],
    resolverAddress: resolver as Address,
    account: accounts[2],
  })
  expect(setAddressRecordTx).toBeTruthy()
  const setAddressRecordTxReceipt = await waitForTransaction(setAddressRecordTx)
  expect(setAddressRecordTxReceipt.status).toBe('success')

  const transferMgrTx = await transferName(walletClient, {
    name: subname,
    newOwnerAddress: accounts[3],
    contract: 'nameWrapper',
    account: accounts[2],
  })
  expect(transferMgrTx).toBeTruthy()
  const transferMgrTxReceipt = await waitForTransaction(transferMgrTx)
  expect(transferMgrTxReceipt.status).toBe('success')
  
})

it('Register - wrapped 2LD - wrapped 3LD - PCC Burned', async () => {
  const name = 'cool-swag-wrap.eth'
  const params: RegistrationParameters = {
    name: name,
    duration: 31536000,
    owner: accounts[1],
    secret,
    resolverAddress: testClient.chain.contracts.ensPublicResolver.address,
    fuses: {
      named: [
        'CANNOT_UNWRAP',
      ],
    }
  }
  await commitAndRegisterName(params, accounts[1])

 //create subname
  const subname = 'subname.cool-swag-wrap.eth'
  const createSubnameTx = await createSubname(walletClient, {
    name: subname,
    contract: 'nameWrapper',
    owner: accounts[2],
    account: accounts[1],
    fuses: {
      parent: { 
        named: [
          'PARENT_CANNOT_CONTROL',
        ],
      },
    }
  })

  expect(createSubnameTx).toBeTruthy()
  const createSubnameTxReceipt = await waitForTransaction(createSubnameTx)
  expect(createSubnameTxReceipt.status).toBe('success')

  const resolver = await getResolver(publicClient, { name: name })

  const transferMgrByParentTx = await transferName(walletClient, {
    name: subname,
    newOwnerAddress: accounts[3],
    contract: 'nameWrapper',
    account: accounts[1],
  })
  expect(transferMgrByParentTx).toBeTruthy()
  const transferMgrByParentTxReceipt = await waitForTransaction(transferMgrByParentTx)
  expect(transferMgrByParentTxReceipt.status).toBe('reverted')

  const transferMgrTx = await transferName(walletClient, {
    name: subname,
    newOwnerAddress: accounts[3],
    contract: 'nameWrapper',
    account: accounts[2],
  })
  expect(transferMgrTx).toBeTruthy()
  const transferMgrTxReceipt = await waitForTransaction(transferMgrTx)
  expect(transferMgrTxReceipt.status).toBe('success')
  
})

it('Register - wrapped 2LD - wrapped 3LD - wrapped 4LD - PCC Burned', async () => {
  const name = 'cool-swag-wrap.eth'
  const params: RegistrationParameters = {
    name: name,
    duration: 31536000,
    owner: accounts[1],
    secret,
    resolverAddress: testClient.chain.contracts.ensPublicResolver.address,
    fuses: {
      named: [
        'CANNOT_UNWRAP',
      ],
    }
  }
  await commitAndRegisterName(params, accounts[1])

 //create subname
  const subname = 'subname.cool-swag-wrap.eth'
  const createSubnameTx = await createSubname(walletClient, {
    name: subname,
    contract: 'nameWrapper',
    owner: accounts[2],
    account: accounts[1],
    fuses: {
      parent: {
        named: [ 'PARENT_CANNOT_CONTROL' ],
      },
      child: {
        named: [ 'CANNOT_UNWRAP' ],
      },
    }
  })

  expect(createSubnameTx).toBeTruthy()
  const createSubnameTxReceipt = await waitForTransaction(createSubnameTx)
  expect(createSubnameTxReceipt.status).toBe('success')

  //create subname
  const subname2 = 'subname.subname.cool-swag-wrap.eth'
  const createSubnameTx2 = await createSubname(walletClient, {
    name: subname2,
    contract: 'nameWrapper',
    owner: accounts[3],
    account: accounts[2],
    fuses: {
      parent: { 
        named: [
          'PARENT_CANNOT_CONTROL',
        ],
      },
    }
  })

  expect(createSubnameTx2).toBeTruthy()
  const createSubnameTxReceipt2 = await waitForTransaction(createSubnameTx2)
  expect(createSubnameTxReceipt2.status).toBe('success')

  const transferMgrByParentTx = await transferName(walletClient, {
    name: subname2,
    newOwnerAddress: accounts[3],
    contract: 'nameWrapper',
    account: accounts[1],
  })
  expect(transferMgrByParentTx).toBeTruthy()
  const transferMgrByParentTxReceipt = await waitForTransaction(transferMgrByParentTx)
  expect(transferMgrByParentTxReceipt.status).toBe('reverted')

  const transferMgrTx = await transferName(walletClient, {
    name: subname2,
    newOwnerAddress: accounts[2],
    contract: 'nameWrapper',
    account: accounts[3],
  })
  expect(transferMgrTx).toBeTruthy()
  const transferMgrTxReceipt = await waitForTransaction(transferMgrTx)
  expect(transferMgrTxReceipt.status).toBe('success')
})