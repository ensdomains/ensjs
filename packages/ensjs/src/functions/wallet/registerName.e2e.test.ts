import { labelhash, type Address, type Hex } from 'viem'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import { nameWrapperOwnerOfSnippet } from '../../contracts/nameWrapper.js'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../test/addTestContracts.js'
import { namehash } from '../../utils/normalise.js'
import type { RegistrationParameters } from '../../utils/registerHelpers.js'
import getPrice from '../public/getPrice.js'
import commitName from './commitName.js'
import registerName from './registerName.js'
import { baseRegistrarNameExpiresSnippet } from '../../contracts/baseRegistrar.js'
import renewNames from './renewNames.js'
import getName from '../public/getName.js'
import setPrimaryName from './setPrimaryName.js'
import setAddressRecord from './setAddressRecord.js'
import getResolver from '../public/getResolver.js'
import getAddressRecord from '../public/getAddressRecord.js'
import getOwner from '../public/getOwner.js'
import unwrapName from './unwrapName.js'
import transferName from './transferName.js'
import createSubname from './createSubname.js'
import { registryOwnerSnippet, registrySetApprovalForAllSnippet } from '../../contracts/registry.js'
import wrapName from './wrapName.js'

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

const getNameWrapperOwner = async (name: string) => {
  return publicClient.readContract({
    abi: nameWrapperOwnerOfSnippet,
    functionName: 'ownerOf',
    address: getChainContractAddress({
      client: publicClient,
      contract: 'ensNameWrapper',
    }),
    args: [BigInt(namehash(name))],
  })
}

const getExpiry = async (name: string) => {
  return publicClient.readContract({
    abi: baseRegistrarNameExpiresSnippet,
    functionName: 'nameExpires',
    address: getChainContractAddress({
      client: publicClient,
      contract: 'ensBaseRegistrarImplementation',
    }),
    args: [BigInt(labelhash(name.split('.')[0]))],
  })
}

const approve = async (address: Address) => {
  return walletClient.writeContract({
    abi: registrySetApprovalForAllSnippet,
    address: getChainContractAddress({
      client: walletClient,
      contract: 'ensRegistry',
    }),
    functionName: 'setApprovalForAll',
    args: [
      getChainContractAddress({
        client: walletClient,
        contract: 'ensNameWrapper',
      }),
      true,
    ],
    account: address,
  })
}

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

it.skip('Register - Add Eth Address - Set Primary Name - Get Primary Name - Get Expiry - Renew Name', async () => {
  const params: RegistrationParameters = {
    name: 'coolest-swag.eth',
    duration: 31536000,
    owner: accounts[1],
    secret,
    resolverAddress: testClient.chain.contracts.ensPublicResolver.address,
  }
  const commitTx = await commitName(walletClient, {
    ...params,
    account: accounts[1],
  })
  expect(commitTx).toBeTruthy()
  const commitReceipt = await waitForTransaction(commitTx)

  expect(commitReceipt.status).toBe('success')

  await testClient.increaseTime({ seconds: 61 })
  await testClient.mine({ blocks: 1 })

  const price = await getPrice(publicClient, {
    nameOrNames: params.name,
    duration: params.duration,
  })
  const total = price!.base + price!.premium

  const tx = await registerName(walletClient, {
    ...params,
    account: accounts[1],
    value: total,
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const owner = await getNameWrapperOwner(params.name)
  expect(owner).toBe(accounts[1])

  // const registerNameTxBlock = (await publicClient.getTransaction({ hash: tx })).blockHash
  // const blockTS = (await publicClient.getBlock({ blockHash: registerNameTxBlock })).timestamp
  // testClient.increaseTime({ seconds: params.duration })
  // testClient.mine({ blocks: 1 })

  const resolver = await getResolver(publicClient, { name: params.name })

  console.log(resolver)

  const setAddressRecordTx = await setAddressRecord(walletClient, {
    name: params.name,
    coin: 'eth',
    value: accounts[1],
    resolverAddress: resolver!,
    account: accounts[1],
  })
  expect(setAddressRecordTx).toBeTruthy()
  const setAddressRecordTxReceipt = await waitForTransaction(setAddressRecordTx)
  expect(setAddressRecordTxReceipt.status).toBe('success')

  testClient.mine({ blocks: 1 })

  const getAddressRecordResult = await getAddressRecord(publicClient, {
    name: params.name,
  })

  console.log(getAddressRecordResult)

  const setPrimaryNameTx = await setPrimaryName(walletClient, {
    name: params.name,
    account: accounts[1],
  })
  expect(setPrimaryNameTx).toBeTruthy()
  const setPrimaryNameTxReceipt = await waitForTransaction(setPrimaryNameTx)
  expect(setPrimaryNameTxReceipt.status).toBe('success')

  await testClient.mine({ blocks: 1 })

  const result = await getName(publicClient, {
    address: accounts[1],
  })

  console.log(result)

  const expiredOwner = await getNameWrapperOwner(params.name)
  expect(expiredOwner).toBe(accounts[1])

  // const newExpiry = await getExpiry(params.name)
  // expect(newExpiry).toBe(BigInt(blockTS) + BigInt(params.duration))

  const renewTx = await renewNames(walletClient, {
    nameOrNames: params.name,
    duration: params.duration,
    value: total,
    account: accounts[0],
  })
  expect(tx).toBeTruthy()
  const renewTxReceipt = await waitForTransaction(renewTx)
  expect(renewTxReceipt.status).toBe('success')

})

it.skip('Register - Get Expiry - Advance time - Renew Name', async () => {
  const params: RegistrationParameters = {
    name: 'coolest-swag.eth',
    duration: 31536000,
    owner: accounts[1],
    secret,
    resolverAddress: testClient.chain.contracts.ensPublicResolver.address,
  }
  const commitTx = await commitName(walletClient, {
    ...params,
    account: accounts[1],
  })
  expect(commitTx).toBeTruthy()
  const commitReceipt = await waitForTransaction(commitTx)

  expect(commitReceipt.status).toBe('success')

  await testClient.increaseTime({ seconds: 61 })
  await testClient.mine({ blocks: 1 })

  const price = await getPrice(publicClient, {
    nameOrNames: params.name,
    duration: params.duration,
  })
  const total = price!.base + price!.premium

  const tx = await registerName(walletClient, {
    ...params,
    account: accounts[1],
    value: total,
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const owner = await getNameWrapperOwner(params.name)
  expect(owner).toBe(accounts[1])

  const registerNameTxBlock = (await publicClient.getTransaction({ hash: tx })).blockHash
  const blockTS = (await publicClient.getBlock({ blockHash: registerNameTxBlock })).timestamp

  const expiry = await getExpiry(params.name)
  expect(expiry).toBe(BigInt(blockTS) + BigInt(params.duration))

  testClient.increaseTime({ seconds: params.duration })
  testClient.mine({ blocks: 1 })

  const resolver = await getResolver(publicClient, { name: params.name })

  console.log(resolver)

  const setAddressRecordTx = await setAddressRecord(walletClient, {
    name: params.name,
    coin: 'eth',
    value: accounts[1],
    resolverAddress: resolver!,
    account: accounts[1],
  })
  expect(setAddressRecordTx).toBeTruthy()
  const setAddressRecordTxReceipt = await waitForTransaction(setAddressRecordTx)
  expect(setAddressRecordTxReceipt.status).toBe('success')

  testClient.mine({ blocks: 1 })

  const getAddressRecordResult = await getAddressRecord(publicClient, {
    name: params.name,
  })

  console.log(getAddressRecordResult)

  const setPrimaryNameTx = await setPrimaryName(walletClient, {
    name: params.name,
    account: accounts[1],
  })
  expect(setPrimaryNameTx).toBeTruthy()
  const setPrimaryNameTxReceipt = await waitForTransaction(setPrimaryNameTx)
  expect(setPrimaryNameTxReceipt.status).toBe('success')

  await testClient.mine({ blocks: 1 })

  const result = await getName(publicClient, {
    address: accounts[1],
  })

  console.log(result)

  const expiredOwner = await getNameWrapperOwner(params.name)
  expect(expiredOwner).toBe(accounts[1])

  const newExpiry = await getExpiry(params.name)
  expect(newExpiry).toBe(BigInt(blockTS) + BigInt(params.duration))

  const renewTx = await renewNames(walletClient, {
    nameOrNames: params.name,
    duration: params.duration,
    value: total,
    account: accounts[0],
  })
  expect(renewTx).toBeTruthy()
  const renewTxReceipt = await waitForTransaction(renewTx)
  expect(renewTxReceipt.status).toBe('success')

  const renewTxTxBlock = (await publicClient.getTransaction({ hash: renewTx })).blockHash
  const renewTxTxBlockTS = (await publicClient.getBlock({ blockHash: renewTxTxBlock })).timestamp

  const nextExpiry = await getExpiry(params.name)
  expect(nextExpiry).toBeGreaterThan(BigInt(renewTxTxBlockTS))

  testClient.increaseTime({ seconds: params.duration * 3})
  testClient.mine({ blocks: 1 })

  const params2: RegistrationParameters = {
    name: 'coolest-swag.eth',
    duration: 31536000,
    owner: accounts[2],
    secret,
    resolverAddress: testClient.chain.contracts.ensPublicResolver.address,
  }
  const commitTx2 = await commitName(walletClient, {
    ...params2,
    account: accounts[2],
  })
  expect(commitTx2).toBeTruthy()
  const commitReceipt2 = await waitForTransaction(commitTx2)

  expect(commitReceipt2.status).toBe('success')
  await testClient.increaseTime({ seconds: 61 })
  await testClient.mine({ blocks: 1 })

  const price2 = await getPrice(publicClient, {
    nameOrNames: params2.name,
    duration: params2.duration,
  })
  const total2 = price2!.base + price2!.premium

  const tx2 = await registerName(walletClient, {
    ...params2,
    account: accounts[2],
    value: total2,
  })

  expect(tx2).toBeTruthy()

  const receipt2 = await waitForTransaction(tx2)

  expect(receipt2.status).toBe('success')
  testClient.mine({ blocks: 1 })

  console.log(receipt2)

  console.log(accounts[2])
  console.log(accounts[1])

  const getAddressRecordResult2 = await getAddressRecord(publicClient, {
    name: params.name,
  })

  console.log(getAddressRecordResult2)

  const result2 = await getName(publicClient, {
    address: accounts[1],
  })

  console.log(result2)

  
})

it.skip('Register - Set other as primary name', async () => {
  const params: RegistrationParameters = {
    name: 'other-eth-record-2.eth',
    duration: 31536000,
    owner: accounts[1],
    secret,
    resolverAddress: testClient.chain.contracts.ensPublicResolver.address,
  }

  type name = 'other-eth-record-2.eth'
  const commitTx = await commitName(walletClient, {
    ...params,
    account: accounts[1],
  })
  expect(commitTx).toBeTruthy()
  const commitReceipt = await waitForTransaction(commitTx)

  expect(commitReceipt.status).toBe('success')

  await testClient.increaseTime({ seconds: 61 })
  await testClient.mine({ blocks: 1 })

  const price = await getPrice(publicClient, {
    nameOrNames: params.name,
    duration: params.duration,
  })
  const total = price!.base + price!.premium

  const tx = await registerName(walletClient, {
    ...params,
    account: accounts[1],
    value: total,
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const owner = await getNameWrapperOwner(params.name)
  expect(owner).toBe(accounts[1])

  const unwrapNameTx = await unwrapName(walletClient, {
    name: params.name as name,
    newOwnerAddress: accounts[1],
    newRegistrantAddress: accounts[1],
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const unwrapNameTxReceipt = await waitForTransaction(unwrapNameTx)
  expect(unwrapNameTxReceipt.status).toBe('success')

  const resolver = await getResolver(publicClient, { name: params.name })

  const setAddressRecordTx = await setAddressRecord(walletClient, {
    name: params.name,
    coin: 'eth',
    value: accounts[2],
    resolverAddress: resolver!,
    account: accounts[1],
  })
  expect(setAddressRecordTx).toBeTruthy()
  const setAddressRecordTxReceipt = await waitForTransaction(setAddressRecordTx)
  expect(setAddressRecordTxReceipt.status).toBe('success')

  testClient.mine({ blocks: 1 })

  const getAddressRecordResult = await getAddressRecord(publicClient, {
    name: params.name,
  })

  console.log(getAddressRecordResult)

  const setPrimaryNameTx = await setPrimaryName(walletClient, {
    name: params.name,
    account: accounts[2],
  })
  expect(setPrimaryNameTx).toBeTruthy()
  const setPrimaryNameTxReceipt = await waitForTransaction(setPrimaryNameTx)
  expect(setPrimaryNameTxReceipt.status).toBe('success')

  await testClient.mine({ blocks: 1 })

  const result = await getName(publicClient, {
    address: accounts[2],
  })

  expect(result).toMatchInlineSnapshot(`
      {
        "match": true,
        "name": "${params.name}",
        "resolverAddress": "${testClient.chain.contracts.ensPublicResolver.address}",
        "reverseResolverAddress": "${testClient.chain.contracts.ensPublicResolver.address}",
      }
    `)
  
})

it.skip('Register - Set other manager as primary name', async () => {
  const params: RegistrationParameters = {
    name: 'other-eth-record-2.eth',
    duration: 31536000,
    owner: accounts[1],
    secret,
    resolverAddress: testClient.chain.contracts.ensPublicResolver.address,
  }

  const commitTx = await commitName(walletClient, {
    ...params,
    account: accounts[1],
  })
  expect(commitTx).toBeTruthy()
  const commitReceipt = await waitForTransaction(commitTx)

  expect(commitReceipt.status).toBe('success')

  await testClient.increaseTime({ seconds: 61 })
  await testClient.mine({ blocks: 1 })

  const price = await getPrice(publicClient, {
    nameOrNames: params.name,
    duration: params.duration,
  })
  const total = price!.base + price!.premium

  const tx = await registerName(walletClient, {
    ...params,
    account: accounts[1],
    value: total,
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const owner = await getNameWrapperOwner(params.name)
  expect(owner).toBe(accounts[1])

  const name = 'other-eth-record-2.eth'
  const unwrapNameTx = await unwrapName(walletClient, {
    name: name,
    newOwnerAddress: accounts[1],
    account: accounts[1],
    newRegistrantAddress: accounts[1],
  })
  expect(tx).toBeTruthy()
  const unwrapNameTxReceipt = await waitForTransaction(unwrapNameTx)
  expect(unwrapNameTxReceipt.status).toBe('success')

  const resolver = await getResolver(publicClient, { name: params.name })

  const transferNameTx = await transferName(walletClient, {
    name: name,
    newOwnerAddress: accounts[3],
    contract: 'registrar',
    account: accounts[1],
  })
  expect(transferNameTx).toBeTruthy()
  const transferNameTxReceipt = await waitForTransaction(transferNameTx)
  expect(transferNameTxReceipt.status).toBe('success')

  const nameDetails = await getOwner(publicClient, {
    name: params.name,
    contract: 'registrar',
  })
  expect(nameDetails!.registrant).toBe(accounts[3])

  const setAddressRecordTx = await setAddressRecord(walletClient, {
    name: params.name,
    coin: 'eth',
    value: accounts[2],
    resolverAddress: resolver!,
    account: accounts[1],
  })
  expect(setAddressRecordTx).toBeTruthy()
  const setAddressRecordTxReceipt = await waitForTransaction(setAddressRecordTx)
  expect(setAddressRecordTxReceipt.status).toBe('success')

  testClient.mine({ blocks: 1 })

  const getAddressRecordResult = await getAddressRecord(publicClient, {
    name: params.name,
  })

  console.log(getAddressRecordResult)

  const setPrimaryNameTx = await setPrimaryName(walletClient, {
    name: params.name,
    account: accounts[3],
  })
  expect(setPrimaryNameTx).toBeTruthy()
  const setPrimaryNameTxReceipt = await waitForTransaction(setPrimaryNameTx)
  expect(setPrimaryNameTxReceipt.status).toBe('success')

  await testClient.mine({ blocks: 1 })

  const result = await getName(publicClient, {
    address: accounts[3],
  })

  expect(result).toMatchInlineSnapshot(`
      {
        "match": true,
        "name": "${params.name}",
        "resolverAddress": "${testClient.chain.contracts.ensPublicResolver.address}",
        "reverseResolverAddress": "${testClient.chain.contracts.ensPublicResolver.address}",
      }
    `)
  
})

it.skip('Register - Set Subname', async () => {
  const params: RegistrationParameters = {
    name: 'cool-swag-wrap.eth',
    duration: 31536000,
    owner: accounts[1],
    secret,
    resolverAddress: testClient.chain.contracts.ensPublicResolver.address,
  }

  const commitTx = await commitName(walletClient, {
    ...params,
    account: accounts[1],
  })
  expect(commitTx).toBeTruthy()
  const commitReceipt = await waitForTransaction(commitTx)

  expect(commitReceipt.status).toBe('success')

  await testClient.increaseTime({ seconds: 61 })
  await testClient.mine({ blocks: 1 })

  const price = await getPrice(publicClient, {
    nameOrNames: params.name,
    duration: params.duration,
  })
  const total = price!.base + price!.premium

  const tx = await registerName(walletClient, {
    ...params,
    account: accounts[1],
    value: total,
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const subName = 'test.cool-swag-wrap.eth'
  const createSubnameTx = await createSubname(walletClient, {
    name: subName,
    contract: 'nameWrapper',
    owner: accounts[2],
    account: accounts[1],
  })
  expect(createSubnameTx).toBeTruthy()
  const createSubnameTxReceipt = await waitForTransaction(createSubnameTx)
  expect(createSubnameTxReceipt.status).toBe('success')

  const owner = await publicClient.readContract({
    abi: nameWrapperOwnerOfSnippet,
    functionName: 'ownerOf',
    address: getChainContractAddress({
      client: publicClient,
      contract: 'ensNameWrapper',
    }),
    args: [BigInt(namehash(subName))],
  })
  expect(owner).toBe(accounts[2])

  const resolver = await getResolver(publicClient, { name: subName })

  console.log(resolver)

  const setAddressRecordTx = await setAddressRecord(walletClient, {
    name: subName,
    coin: 'eth',
    value: accounts[2],
    resolverAddress: resolver as Address,
    account: accounts[2],
  })
  expect(setAddressRecordTx).toBeTruthy()
  const setAddressRecordTxReceipt = await waitForTransaction(setAddressRecordTx)
  expect(setAddressRecordTxReceipt.status).toBe('success')

  testClient.mine({ blocks: 1 })

  const getAddressRecordResult = await getAddressRecord(publicClient, {
    name: subName,
  })

  console.log(getAddressRecordResult)

  const setPrimaryNameTx = await setPrimaryName(walletClient, {
    name: subName,
    account: accounts[2],
  })
  expect(setPrimaryNameTx).toBeTruthy()
  const setPrimaryNameTxReceipt = await waitForTransaction(setPrimaryNameTx)
  expect(setPrimaryNameTxReceipt.status).toBe('success')

  await testClient.mine({ blocks: 1 })

  const result = await getName(publicClient, {
    address: accounts[2],
  })

  expect(result).toMatchInlineSnapshot(`
      {
        "match": true,
        "name": "${subName}",
        "resolverAddress": "${testClient.chain.contracts.ensPublicResolver.address}",
        "reverseResolverAddress": "${testClient.chain.contracts.ensPublicResolver.address}",
      }
    `)
})

it.skip('Register - unwrap 2LD - wrap Subname', async () => {
  const name = 'cool-swag-wrap.eth'
  const params: RegistrationParameters = {
    name: name,
    duration: 31536000,
    owner: accounts[1],
    secret,
    resolverAddress: testClient.chain.contracts.ensPublicResolver.address,
  }

  const commitTx = await commitName(walletClient, {
    ...params,
    account: accounts[1],
  })
  expect(commitTx).toBeTruthy()
  const commitReceipt = await waitForTransaction(commitTx)

  expect(commitReceipt.status).toBe('success')

  await testClient.increaseTime({ seconds: 61 })
  await testClient.mine({ blocks: 1 })

  const price = await getPrice(publicClient, {
    nameOrNames: params.name,
    duration: params.duration,
  })
  const total = price!.base + price!.premium

  const tx = await registerName(walletClient, {
    ...params,
    account: accounts[1],
    value: total,
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const unwrapNameTx = await unwrapName(walletClient, {
    name: name,
    newOwnerAddress: accounts[1],
    newRegistrantAddress: accounts[1],
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const unwrapNameTxReceipt = await waitForTransaction(unwrapNameTx)
  expect(unwrapNameTxReceipt.status).toBe('success')

  const nameOwner = await getOwner(publicClient, {
    name: name,
  })
  expect(nameOwner!.owner).toBe(accounts[1])
  expect(nameOwner!.registrant).toBe(accounts[1])
  expect(nameOwner!.ownershipLevel).toBe('registrar')

  const subName = 'test.cool-swag-wrap.eth'
  const createSubnameTx = await createSubname(walletClient, {
    name: subName,
    contract: 'registry',
    owner: accounts[2],
    account: accounts[1],
  })
  expect(createSubnameTx).toBeTruthy()
  const createSubnameTxReceipt = await waitForTransaction(createSubnameTx)
  expect(createSubnameTxReceipt.status).toBe('success')

  const subNameOwner = await publicClient.readContract({
    abi: registryOwnerSnippet,
    functionName: 'owner',
    address: getChainContractAddress({
      client: publicClient,
      contract: 'ensRegistry',
    }),
    args: [namehash(subName)],
  })
  expect(subNameOwner).toBe(accounts[2])

  const resolver = await getResolver(publicClient, { name: subName })

  console.log(resolver)

  await approve(accounts[2])

  const wrapNameTx = await wrapName(walletClient, {
    name: subName,
    newOwnerAddress: accounts[2],
    account: accounts[2],
  })
  expect(tx).toBeTruthy()
  const wrapNameTxReceipt = await waitForTransaction(wrapNameTx)
  expect(wrapNameTxReceipt.status).toBe('success')

  const owner = await getOwner(publicClient, {
    name: subName,
  })
  expect(owner!.owner).toBe(accounts[2])
  expect(owner!.ownershipLevel).toBe('nameWrapper')
  

  
})