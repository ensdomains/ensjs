import { Address, Hex } from 'viem'
import { ownerOfSnippet } from '../../contracts/erc721'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { ownerSnippet } from '../../contracts/registry'
import {
  publicClient,
  testClient,
  walletClient,
} from '../../tests/addTestContracts'
import { namehash } from '../../utils/normalise'
import createSubname from './createSubname'

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

it('should allow creating a subname on the registry', async () => {
  const tx = await createSubname(walletClient, {
    name: 'test.test123.eth',
    contract: 'registry',
    owner: accounts[0],
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx })
  expect(receipt.status).toBe('success')

  const owner = await publicClient.readContract({
    abi: ownerSnippet,
    functionName: 'owner',
    address: getChainContractAddress({
      client: publicClient,
      contract: 'ensRegistry',
    }),
    args: [namehash('test.test123.eth')],
  })
  expect(owner).toBe(accounts[0])
})

it('should allow creating a subname on the namewrapper', async () => {
  const tx = await createSubname(walletClient, {
    name: 'test.wrapped.eth',
    contract: 'nameWrapper',
    owner: accounts[0],
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx })
  expect(receipt.status).toBe('success')

  const owner = await publicClient.readContract({
    abi: ownerOfSnippet,
    functionName: 'ownerOf',
    address: getChainContractAddress({
      client: publicClient,
      contract: 'ensNameWrapper',
    }),
    args: [BigInt(namehash('test.wrapped.eth'))],
  })
  expect(owner).toBe(accounts[0])
})
