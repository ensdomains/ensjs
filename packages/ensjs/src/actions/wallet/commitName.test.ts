import type { Address, Hex } from 'viem'
import { afterEach, beforeAll, beforeEach, expect, it } from 'vitest'
import { getChainContractAddress } from '../../clients/shared.js'
import { l2EthRegistrarCommitmentsSnippet } from '../../contracts/l2EthRegistrar.js'
import {
  publicClientL2,
  testClientL2,
  walletClientL2,
} from '../../test/addTestContracts.js'
import {
  type L2RegistrationParameters,
  makeL2Commitment,
} from '../../utils/l2RegisterHelpers.js'
import { commitName } from './commitName.js'

let snapshot: Hex
let accounts: Address[]

beforeAll(async () => {
  accounts = await walletClientL2.getAddresses()
})

beforeEach(async () => {
  snapshot = await testClientL2.snapshot()
})

afterEach(async () => {
  await testClientL2.revert({ id: snapshot })
})

const secret = `0x${'a'.repeat(64)}` as Hex

it('should return a commit transaction and succeed', async () => {
  const params: L2RegistrationParameters = {
    label: 'wrapped-with-subnames',
    duration: 31536000,
    owner: accounts[1],
    secret,
  }
  const tx = await commitName(walletClientL2, {
    ...params,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await publicClientL2.waitForTransactionReceipt({ hash: tx })
  expect(receipt.status).toBe('success')

  const commitmentAt = await publicClientL2.readContract({
    abi: l2EthRegistrarCommitmentsSnippet,
    functionName: 'commitmentAt',
    address: getChainContractAddress({
      chain: publicClientL2.chain,
      contract: 'ethRegistrar',
    }),
    args: [makeL2Commitment(params)],
  })
  expect(commitmentAt).toBeGreaterThan(0n)
})
