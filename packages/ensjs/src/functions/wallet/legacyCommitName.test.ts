import { labelhash, type Address, type Hex } from 'viem'
import { afterEach, beforeAll, beforeEach, expect, it } from 'vitest'
import { ethRegistrarControllerCommitmentsSnippet } from '../../contracts/ethRegistrarController.js'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../test/addTestContracts.js'
import {
  makeLegacyCommitment,
  type LegacyRegistrationParameters,
} from '../../utils/legacyRegisterHelpers.js'
import legacyCommitName from './legacyCommitName.js'
import { legacyEthRegistrarControllerCommitmentsSnippet, legacyEthRegistrarControllerMakeCommitmentSnippet, legacyEthRegistrarControllerMakeCommitmentWithConfigSnippet } from '../../contracts/legacyEthRegistrarController.js'
import { EMPTY_ADDRESS } from '../../utils/consts.js'

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

it.only('should something', async () => {
  const params: LegacyRegistrationParameters = {
    name: 'wrapped-with-subnames.eth',
    duration: 31536000,
    owner: accounts[1],
    secret,
  }
  const label = params.name.split('.')[0]
  const labelHash = labelhash(params.name.split('.')[0])
  const makeCommitment = await publicClient.readContract({
    abi: legacyEthRegistrarControllerMakeCommitmentSnippet,
    functionName: 'makeCommitment',
    address: getChainContractAddress({
      client: publicClient,
      contract: 'legacyEthRegistrarController',
    }),
    args: [label, params.owner, params.secret],
  })
  console.log('makeCommitment', makeCommitment)

  const test = makeLegacyCommitment(params)
  expect(test).toEqual(makeCommitment)
})

it('should something 2', async () => {
  const params: LegacyRegistrationParameters = {
    name: 'wrapped-with-subnames.eth',
    duration: 31536000,
    owner: accounts[1],
    secret,
  }
  const labelHash = labelhash(params.name.split('.')[0])
  const makeCommitment = await publicClient.readContract({
    abi: legacyEthRegistrarControllerMakeCommitmentWithConfigSnippet,
    functionName: 'makeCommitmentWithConfig',
    address: getChainContractAddress({
      client: publicClient,
      contract: 'legacyEthRegistrarController',
    }),
    args: [labelHash, params.owner, params.secret, EMPTY_ADDRESS, EMPTY_ADDRESS],
  })
  console.log('>>> 2', makeCommitment)

  const test = makeLegacyCommitment(params)
  expect(test).toEqual(makeCommitment)
})

it('should return a commit transaction and succeed', async () => {
  const params: LegacyRegistrationParameters = {
    name: 'wrapped-with-subnames.eth',
    duration: 31536000,
    owner: accounts[1],
    secret,
  }
  const tx = await legacyCommitName(walletClient, {
    ...params,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const commitment = await publicClient.readContract({
    abi: legacyEthRegistrarControllerCommitmentsSnippet,
    functionName: 'commitments',
    address: getChainContractAddress({
      client: publicClient,
      contract: 'legacyEthRegistrarController',
    }),
    args: [makeLegacyCommitment(params)],
  })
  expect(commitment).toBeTruthy()
})
