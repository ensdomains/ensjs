import { type Address, type Hex, zeroHash, encodeFunctionData } from 'viem'
import { afterEach, beforeAll, beforeEach, expect, it, describe } from 'vitest'
import { sendTransaction } from 'viem/actions'

import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import {
  nameWrapperGetDataSnippet,
  nameWrapperOwnerOfSnippet,
} from '../../contracts/nameWrapper.js'
import {
  registryOwnerSnippet,
  registrySetApprovalForAllSnippet,
} from '../../contracts/registry.js'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../test/addTestContracts.js'
import { namehash } from '../../utils/normalise.js'
import createSubname from './createSubname.js'
import setFuses from './setFuses.js'
import getWrapperData from '../public/getWrapperData.js'
import type { RegistrationParameters } from '../../utils/index.js'
import commitName from './commitName.js'
import getPrice from '../public/getPrice.js'
import registerName from './registerName.js'
import getOwner from '../public/getOwner.js'

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
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const owner = await publicClient.readContract({
    abi: registryOwnerSnippet,
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
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const owner = await publicClient.readContract({
    abi: nameWrapperOwnerOfSnippet,
    functionName: 'ownerOf',
    address: getChainContractAddress({
      client: publicClient,
      contract: 'ensNameWrapper',
    }),
    args: [BigInt(namehash('test.wrapped.eth'))],
  })
  expect(owner).toBe(accounts[0])

  const data = await publicClient.readContract({
    abi: nameWrapperGetDataSnippet,
    functionName: 'getData',
    address: getChainContractAddress({
      client: publicClient,
      contract: 'ensNameWrapper',
    }),
    args: [BigInt(namehash('test.wrapped.eth'))],
  })
  expect(data[2]).toBe(0n)
})

it('should create a subname on the namewrapper with max expiry if pcc is burned and no expiry is set', async () => {
  const setupTx = await setFuses(walletClient, {
    name: 'wrapped.eth',
    fuses: {
      named: ['CANNOT_UNWRAP'],
    },
    account: accounts[1],
  })
  expect(setupTx).toBeTruthy()
  const setUpReceipt = await waitForTransaction(setupTx)
  expect(setUpReceipt.status).toBe('success')

  const parentWrapperData = await getWrapperData(publicClient, {
    name: 'wrapped.eth',
  })

  const tx = await createSubname(walletClient, {
    name: 'test.wrapped.eth',
    contract: 'nameWrapper',
    owner: accounts[0],
    account: accounts[1],
    fuses: { parent: { named: ['PARENT_CANNOT_CONTROL'] } },
  })
  expect(tx).toBeTruthy()
  const receipt = await waitForTransaction(tx)
  expect(receipt.status).toBe('success')

  const owner = await publicClient.readContract({
    abi: nameWrapperOwnerOfSnippet,
    functionName: 'ownerOf',
    address: getChainContractAddress({
      client: publicClient,
      contract: 'ensNameWrapper',
    }),
    args: [BigInt(namehash('test.wrapped.eth'))],
  })
  expect(owner).toBe(accounts[0])

  const data = await getWrapperData(publicClient, { name: 'test.wrapped.eth' })
  expect(data?.expiry?.value).toBeTruthy()
  expect(data!.expiry!.value).toBe(parentWrapperData?.expiry?.value)
})

it('should throw an error when creating a wrapped subname with PCC burned with a parent name that has not burned CANNOT_UNWRAP', async () => {
  await expect(
    createSubname(walletClient, {
      name: 'test.wrapped.eth',
      contract: 'nameWrapper',
      owner: accounts[0],
      account: accounts[1],
      fuses: { parent: { named: ['PARENT_CANNOT_CONTROL'] } },
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `
    [CreateSubnameParentNotLockedError: Create subname error: Cannot burn PARENT_CANNOT_CONTROL when wrapped.eth has not burned CANNOT_UNWRAP fuse
    
    Version: @ensdomains/ensjs@1.0.0-mock.0]
    `,
  )
})

it('should throw an error when creating a wrapped subname with a parent name that has burned CANNOT_CREATE_SUBDOMAINS', async () => {
  const parentTx = await setFuses(walletClient, {
    name: 'wrapped.eth',
    fuses: { named: ['CANNOT_UNWRAP', 'CANNOT_CREATE_SUBDOMAIN'] },
    account: accounts[1],
  })
  expect(parentTx).toBeTruthy()
  const setUpReceipt = await waitForTransaction(parentTx)
  expect(setUpReceipt.status).toBe('success')
  await expect(
    createSubname(walletClient, {
      name: 'test.wrapped.eth',
      contract: 'nameWrapper',
      owner: accounts[0],
      account: accounts[1],
      fuses: { parent: { named: ['PARENT_CANNOT_CONTROL'] } },
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `
    [CreateSubnamePermissionDeniedError: Create subname error: wrapped.eth as burned CANNOT_CREATE_SUBDOMAIN fuse

    Version: @ensdomains/ensjs@1.0.0-mock.0]
    `,
  )
})

describe('L2 offchain domains', () => {
  beforeEach(async () => {
    const paramsParent: RegistrationParameters = {
      name: 'parent.eth',
      duration: 31536000,
      owner: accounts[0],
      secret: zeroHash,
      resolverAddress: '0x4A4bF4AFf08A1060B5780BE5658b541C427A9E85',
    }
    const commitTxParent = await commitName(walletClient, {
      ...paramsParent,
      account: accounts[0],
    })
    await waitForTransaction(commitTxParent)

    await testClient.increaseTime({ seconds: 61 })
    await testClient.mine({ blocks: 1 })

    const priceParent = await getPrice(publicClient, {
      nameOrNames: paramsParent.name,
      duration: paramsParent.duration,
    })

    const txParent = await registerName(walletClient, {
      ...paramsParent,
      account: accounts[0],
      value: priceParent!.base + priceParent!.premium,
    })
    expect(txParent).toBeTruthy()
    const receiptParent = await waitForTransaction(txParent)
    expect(receiptParent.status).toBe('success')

    const tx = await sendTransaction(walletClient, {
      to: '0x0635513f179D50A207757E05759CbD106d7dFcE8',
      data: encodeFunctionData({
        functionName: 'setApprovalForAll',
        abi: registrySetApprovalForAllSnippet,
        args: ['0xEc216900e68df20674303982a87a678CA8B79167', true],
      }),
      account: accounts[0],
    })
    expect(tx).toBeTruthy()
    const receipt = await waitForTransaction(tx)
    expect(receipt.status).toBe('success')
  })

  it('should allow creating a subname without records', async () => {
    const tx = await createSubname(walletClient, {
      name: 'test.parent.eth',
      contract: 'nameWrapper',
      owner: accounts[0],
      account: accounts[0],
      resolverAddress: '0x4A4bF4AFf08A1060B5780BE5658b541C427A9E85',
    })
    expect(tx).toBeTruthy()
    const receipt = await waitForTransaction(tx)
    expect(receipt.status).toBe('success')

    const { owner } = await getOwner(publicClient, {
      name: 'test.parent.eth',
      contract: 'nameWrapper',
    })
    expect(owner).toBe(accounts[0])
  })
})

// This requires an API compliant with the ERC-7884 Operation Router and so,
// cannot be run remotely
// describe('DB offchain domains', () => {
//   beforeEach(async () => {
//     const paramsParent: RegistrationParameters = {
//       name: 'parent.eth',
//       duration: 31536000,
//       owner: accounts[0],
//       secret: zeroHash,
//       resolverAddress: '0x7Dc07Bc3a73E6B3d231DCF1b6F23eD20cB12132c',
//     }
//     const commitTxParent = await commitName(walletClient, {
//       ...paramsParent,
//       account: accounts[0],
//     })
//     await waitForTransaction(commitTxParent)

//     await testClient.increaseTime({ seconds: 61 })
//     await testClient.mine({ blocks: 1 })

//     const priceParent = await getPrice(publicClient, {
//       nameOrNames: paramsParent.name,
//       duration: paramsParent.duration,
//     })

//     const txParent = await registerName(walletClient, {
//       ...paramsParent,
//       account: accounts[0],
//       value: priceParent!.base + priceParent!.premium,
//     })
//     expect(txParent).toBeTruthy()
//     const receiptParent = await waitForTransaction(txParent)
//     expect(receiptParent.status).toBe('success')
//   })

//   it('should allow creating a subname without records', async () => {
//     const tx = await createSubname(walletClient, {
//       name: 'test.parent.eth',
//       contract: 'nameWrapper',
//       owner: accounts[0],
//       account: accounts[0],
//       resolverAddress: '0x7Dc07Bc3a73E6B3d231DCF1b6F23eD20cB12132c',
//     })
//     expect(tx).toBeTruthy()
//     const receipt = await waitForTransaction(tx)
//     expect(receipt.status).toBe('success')

//     const { owner } = await getOwner(publicClient, {
//       name: 'test.parent.eth',
//       contract: 'nameWrapper',
//     })
//     expect(owner).toBe(accounts[0])
//   })
// })
