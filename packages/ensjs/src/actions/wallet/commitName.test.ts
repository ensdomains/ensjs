import { ethRegistrarCommitmentsSnippet } from '@ensdomains/ensjs-abi/v2/ethRegistrar'
import type { Address, Hex } from 'viem'
import { afterEach, beforeAll, beforeEach, expect, it } from 'vitest'
import { getChainContractAddress } from '../../clients/shared.js'
import {
  publicClient,
  testClient,
  walletClient,
} from '../../test/addTestContracts.js'
import {
  type L2RegistrationParameters,
  makeL2Commitment,
} from '../../utils/l2RegisterHelpers.js'
import { commitName } from './commitName.js'

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
  const params: L2RegistrationParameters = {
    label: 'wrapped-with-subnames',
    duration: 31536000,
    owner: accounts[1],
    secret,
  }
  const tx = await commitName(walletClient, {
    ...params,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx })
  expect(receipt.status).toBe('success')

  const commitmentAt = await publicClient.readContract({
    abi: ethRegistrarCommitmentsSnippet,
    functionName: 'commitmentAt',
    address: getChainContractAddress({
      chain: publicClient.chain,
      contract: 'ethRegistrar',
    }),
    args: [makeL2Commitment(params)],
  })
  expect(commitmentAt).toBeGreaterThan(0n)
})
