import { type Address, type Hex, zeroAddress } from 'viem'
import { afterEach, beforeAll, beforeEach, expect, it } from 'vitest'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import { nameWrapperOwnerOfSnippet } from '../../contracts/nameWrapper.js'
import {
  registryOwnerSnippet,
  registryResolverSnippet,
} from '../../contracts/registry.js'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../test/addTestContracts.js'
import { namehash } from '../../utils/name/namehash.js'
import { deleteSubname } from './deleteSubname.js'

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

const getOwner = async (name: string) => {
  return publicClient.readContract({
    abi: registryOwnerSnippet,
    functionName: 'owner',
    address: getChainContractAddress({
      client: publicClient,
      contract: 'ensRegistry',
    }),
    args: [namehash(name)],
  })
}

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

const getResolver = async (name: string) => {
  return publicClient.readContract({
    abi: registryResolverSnippet,
    functionName: 'resolver',
    address: getChainContractAddress({
      client: publicClient,
      contract: 'ensRegistry',
    }),
    args: [namehash(name)],
  })
}

it('should allow deleting a subname on the registry by parent owner', async () => {
  const tx = await deleteSubname(walletClient, {
    name: 'test.with-subnames.eth',
    contract: 'registry',
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const owner = await getOwner('test.with-subnames.eth')
  expect(owner).toBe(zeroAddress)

  const resolver = await getResolver('test.with-subnames.eth')
  expect(resolver).toBe(zeroAddress)
})

it('should allow deleting a subname on the namewrapper by parent owner', async () => {
  const tx = await deleteSubname(walletClient, {
    name: 'test.wrapped-with-subnames.eth',
    contract: 'nameWrapper',
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const owner = await getOwner('test.wrapped-with-subnames.eth')
  expect(owner).toBe(zeroAddress)

  const resolver = await getResolver('test.wrapped-with-subnames.eth')
  expect(resolver).toBe(zeroAddress)

  const nameWrapperOwner = await getNameWrapperOwner(
    'test.wrapped-with-subnames.eth',
  )
  expect(nameWrapperOwner).toBe(zeroAddress)
})

it('should allow deleting a subname on the namewrapper by name owner', async () => {
  const tx = await deleteSubname(walletClient, {
    name: 'addr.wrapped-with-subnames.eth',
    contract: 'nameWrapper',
    asOwner: true,
    account: accounts[2],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const owner = await getOwner('addr.wrapped-with-subnames.eth')
  expect(owner).toBe(zeroAddress)

  const resolver = await getResolver('addr.wrapped-with-subnames.eth')
  expect(resolver).toBe(zeroAddress)

  const nameWrapperOwner = await getNameWrapperOwner(
    'addr.wrapped-with-subnames.eth',
  )
  expect(nameWrapperOwner).toBe(zeroAddress)
})

it('should not allow deleting top level domain', async () => {
  await expect(
    deleteSubname(walletClient, {
      name: 'eth',
      contract: 'nameWrapper',
      asOwner: true,
      account: accounts[1],
    }),
  ).rejects.toThrow()
})

it('should not allow deleting second level domain', async () => {
  await expect(
    deleteSubname(walletClient, {
      name: 'test123.eth',
      contract: 'registry',
      account: accounts[1],
    }),
  ).rejects.toThrow()
})
