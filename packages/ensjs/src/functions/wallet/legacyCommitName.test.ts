import type { Address, Hex } from 'viem'
import { afterEach, beforeAll, beforeEach, expect, it } from 'vitest'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import { legacyEthRegistrarControllerCommitmentsSnippet } from '../../contracts/legacyEthRegistrarController.js'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../test/addTestContracts.js'
import {
  type LegacyRegistrationParameters,
  makeLegacyCommitment,
} from '../../utils/legacyRegisterHelpers.js'
import legacyCommitName from './legacyCommitName.js'

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
