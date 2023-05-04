import { Address, Hex } from 'viem'
import { ownerOfSnippet } from '../../contracts/erc721'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../tests/addTestContracts'
import { namehash } from '../../utils/normalise'
import { RegistrationParameters } from '../../utils/registerHelpers'
import getPrice from '../read/getPrice'
import commitName from './commitName'
import registerName from './registerName'

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

const secret = `0x${'a'.repeat(64)}` as Hex

const getNameWrapperOwner = async (name: string) => {
  return publicClient.readContract({
    abi: ownerOfSnippet,
    functionName: 'ownerOf',
    address: getChainContractAddress({
      client: publicClient,
      contract: 'ensNameWrapper',
    }),
    args: [BigInt(namehash(name))],
  })
}

it('should return a registration transaction and succeed', async () => {
  const params: RegistrationParameters = {
    name: 'cool-swag.eth',
    duration: 31536000,
    owner: accounts[1],
    secret,
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
})
