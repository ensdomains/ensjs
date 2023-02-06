import { ethers } from 'ethers'
import { ENS } from '..'
import setup from '../tests/setup'
import { namehash } from '../utils/normalise'

let ensInstance: ENS
let revert: Awaited<ReturnType<typeof setup>>['revert']
let provider: ethers.providers.JsonRpcProvider
let accounts: string[]

beforeAll(async () => {
  ;({ ensInstance, revert, provider } = await setup())
  accounts = await provider.listAccounts()
})

afterAll(async () => {
  await revert()
})

describe('transferSubname', () => {
  beforeEach(async () => {
    await revert()
  })
  it('should allow transferring a subname on the registry', async () => {
    const tx = await ensInstance.transferSubname('test.with-subnames.eth', {
      contract: 'registry',
      owner: accounts[1],
      addressOrIndex: 1,
    })
    expect(tx).toBeTruthy()
    await tx.wait()

    const registry = await ensInstance.contracts!.getRegistry()!
    const result = await registry.owner(namehash('test.with-subnames.eth'))
    expect(result).toBe(accounts[1])
  })

  it('should NOT allow transferring a subname on the nameWrapper by name owner', async () => {
    expect(
      ensInstance.transferSubname('addr.wrapped-with-subnames.eth', {
        contract: 'nameWrapper',
        owner: accounts[1],
        addressOrIndex: 2,
      }),
    ).rejects.toThrow()
  })

  it('should allow transferring a subname on the nameWrapper by parent owner', async () => {
    const tx = await ensInstance.transferSubname(
      'test.wrapped-with-subnames.eth',
      {
        contract: 'nameWrapper',
        owner: accounts[1],
        addressOrIndex: 1,
      },
    )
    expect(tx).toBeTruthy()
    await tx.wait()

    const nameWrapper = await ensInstance.contracts!.getNameWrapper()!
    const result = await nameWrapper.ownerOf(
      namehash('test.wrapped-with-subnames.eth'),
    )
    expect(result).toBe(accounts[1])
  })

  it('should NOT allow transferring a subname on the nameWrapper with PCC burned by parent owner', async () => {
    const nameWrapper = await ensInstance.contracts!.getNameWrapper()!

    const tx0 = await ensInstance.setFuses('wrapped-with-subnames.eth', {
      named: ['CANNOT_UNWRAP'],
      addressOrIndex: 1,
    })
    expect(tx0).toBeTruthy()
    await tx0.wait()

    const tx1 = await ensInstance.setChildFuses(
      'legacy.wrapped-with-subnames.eth',
      {
        fuses: {
          parent: {
            named: ['PARENT_CANNOT_CONTROL'],
          },
        },
        addressOrIndex: 1,
      },
    )
    expect(tx1).toBeTruthy()
    await tx1.wait()

    const checkOwner = await nameWrapper.ownerOf(
      namehash('legacy.wrapped-with-subnames.eth'),
    )
    expect(checkOwner).toBe(accounts[2])

    expect(
      ensInstance.transferSubname('legacy.wrapped-with-subnames.eth', {
        contract: 'nameWrapper',
        owner: accounts[1],
        addressOrIndex: 1,
      }),
    ).rejects.toThrow()

    const result = await nameWrapper.ownerOf(
      namehash('legacy.wrapped-with-subnames.eth'),
    )
    expect(result).toBe(accounts[2])
  })

  it('should allow transferring a subname on the nameWrapper with PCC burned by name owner', async () => {
    const nameWrapper = await ensInstance.contracts!.getNameWrapper()!

    const tx0 = await ensInstance.setFuses('wrapped-with-subnames.eth', {
      named: ['CANNOT_UNWRAP'],
      addressOrIndex: 1,
    })
    expect(tx0).toBeTruthy()
    await tx0.wait()

    const tx1 = await ensInstance.setChildFuses(
      'xyz.wrapped-with-subnames.eth',
      {
        fuses: {
          parent: {
            named: ['PARENT_CANNOT_CONTROL'],
          },
        },
        addressOrIndex: 1,
      },
    )
    expect(tx1).toBeTruthy()
    await tx1.wait()

    const checkOwner = await nameWrapper.ownerOf(
      namehash('xyz.wrapped-with-subnames.eth'),
    )
    expect(checkOwner).toBe(accounts[2])

    const tx = await ensInstance.transferSubname(
      'xyz.wrapped-with-subnames.eth',
      {
        contract: 'nameWrapper',
        owner: accounts[1],
        addressOrIndex: 2,
      },
    )
    expect(tx).toBeTruthy()
    await tx.wait()

    const result = await nameWrapper.ownerOf(
      namehash('xyz.wrapped-with-subnames.eth'),
    )
    expect(result).toBe(accounts[1])
  })
})
