import type { Address, Hex } from 'viem'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import { nameWrapperGetDataSnippet } from '../../contracts/nameWrapper.js'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../test/addTestContracts.js'
import { userSettableFuseEnum } from '../../utils/fuses.js'
import { namehash } from '../../utils/normalise.js'
import setChildFuses from './setChildFuses.js'
import setFuses from './setFuses.js'

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

const checkFuses = (
  fuses: number,
  expected: (keyof typeof userSettableFuseEnum)[],
) => {
  // eslint-disable-next-line guard-for-in
  for (const fuse in userSettableFuseEnum) {
    const active =
      (fuses &
        userSettableFuseEnum[fuse as keyof typeof userSettableFuseEnum]) >
      0
    if (expected.includes(fuse as keyof typeof userSettableFuseEnum)) {
      try {
        expect(active).toBeTruthy()
      } catch {
        throw new Error(`${fuse} should be true but is false`)
      }
    } else if (active) {
      try {
        expect(active).toBeFalsy()
      } catch {
        throw new Error(`${fuse} should be false but is true`)
      }
    }
  }
}

const getFuses = async (name: string) => {
  const [, fuses] = await publicClient.readContract({
    abi: nameWrapperGetDataSnippet,
    address: getChainContractAddress({
      client: publicClient,
      contract: 'ensNameWrapper',
    }),
    functionName: 'getData',
    args: [BigInt(namehash(name))],
  })
  return fuses
}

it('should return a setChildFuses transaction and succeed', async () => {
  const setParentTx = await setFuses(walletClient, {
    name: 'wrapped-with-subnames.eth',
    fuses: {
      named: ['CANNOT_UNWRAP'],
    },
    account: accounts[1],
  })
  expect(setParentTx).toBeTruthy()
  const setParentTxReceipt = await waitForTransaction(setParentTx)
  expect(setParentTxReceipt.status).toBe('success')

  const tx = await setChildFuses(walletClient, {
    name: 'test.wrapped-with-subnames.eth',
    fuses: 65537 + 64,
    account: accounts[1],
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const fuses = await getFuses('test.wrapped-with-subnames.eth')

  checkFuses(fuses, [
    'CANNOT_UNWRAP',
    'PARENT_CANNOT_CONTROL',
    'CANNOT_APPROVE',
  ])
})
