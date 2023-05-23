import { Address, Hex } from 'viem'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { getDataSnippet } from '../../contracts/nameWrapper'
import {
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../tests/addTestContracts'
import {
  unnamedUserSettableFuses,
  userSettableFuseEnum,
} from '../../utils/fuses'
import { namehash } from '../../utils/normalise'
import setFuses from './setFuses'

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

const checkUnnamedFuses = (
  fuses: number,
  expected: (keyof typeof unnamedUserSettableFuses)[],
) => {
  // eslint-disable-next-line guard-for-in
  for (const fuse of unnamedUserSettableFuses) {
    const active = (fuses & fuse) > 0
    if (expected.includes(fuse as keyof typeof unnamedUserSettableFuses)) {
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
    abi: getDataSnippet,
    address: getChainContractAddress({
      client: publicClient,
      contract: 'ensNameWrapper',
    }),
    functionName: 'getData',
    args: [BigInt(namehash(name))],
  })
  return fuses
}

describe('Array', () => {
  it('should return a setFuses transaction from a named fuse array and succeed', async () => {
    const tx = await setFuses(walletClient, {
      name: 'wrapped.eth',
      fuses: {
        named: [
          'CANNOT_UNWRAP',
          'CANNOT_CREATE_SUBDOMAIN',
          'CANNOT_SET_TTL',
          'CANNOT_APPROVE',
        ],
      },
      account: accounts[1],
    })
    const receipt = await waitForTransaction(tx)
    expect(receipt.status).toBe('success')

    const fuses = await getFuses('wrapped.eth')
    checkFuses(fuses, [
      'CANNOT_UNWRAP',
      'CANNOT_CREATE_SUBDOMAIN',
      'CANNOT_SET_TTL',
      'PARENT_CANNOT_CONTROL',
      'CANNOT_APPROVE',
    ])
  })
  it('should return a setFuses transaction from an unnamed fuse array and succeed', async () => {
    const tx0 = await setFuses(walletClient, {
      name: 'wrapped.eth',
      fuses: {
        named: ['CANNOT_UNWRAP'],
      },
      account: accounts[1],
    })
    const tx0Receipt = await waitForTransaction(tx0)
    expect(tx0Receipt.status).toBe('success')

    const tx = await setFuses(walletClient, {
      name: 'wrapped.eth',
      fuses: {
        unnamed: [128, 256, 512],
      },
      account: accounts[1],
    })
    const receipt = await waitForTransaction(tx)
    expect(receipt.status).toBe('success')

    const fuses = await getFuses('wrapped.eth')
    checkUnnamedFuses(fuses, [128, 256, 512])
  })
  it('should return a setFuses transaction from both an unnamed and named fuse array and succeed', async () => {
    const tx = await setFuses(walletClient, {
      name: 'wrapped.eth',
      fuses: {
        named: [
          'CANNOT_UNWRAP',
          'CANNOT_CREATE_SUBDOMAIN',
          'CANNOT_SET_TTL',
          'CANNOT_APPROVE',
        ],
        unnamed: [128, 256, 512],
      },
      account: accounts[1],
    })
    const receipt = await waitForTransaction(tx)
    expect(receipt.status).toBe('success')

    const fuses = await getFuses('wrapped.eth')
    checkFuses(fuses, [
      'CANNOT_UNWRAP',
      'CANNOT_CREATE_SUBDOMAIN',
      'CANNOT_SET_TTL',
      'PARENT_CANNOT_CONTROL',
      'CANNOT_APPROVE',
    ])
    checkUnnamedFuses(fuses, [128, 256, 512])
  })
  it('should throw an error when trying to burn a named fuse in an unnamed fuse array', async () => {
    await expect(
      setFuses(walletClient, {
        name: 'wrapped.eth',
        fuses: {
          unnamed: [32] as any,
        },

        account: accounts[1],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "32 is not a valid unnamed fuse

      - If you are trying to set a named fuse, use the named property

      Version: @ensdomains/ensjs@3.0.0-alpha.62"
    `)
  })
  it('should throw an error when trying to burn an unnamed fuse in a named fuse array', async () => {
    await expect(
      setFuses(walletClient, {
        name: 'wrapped.eth',
        fuses: {
          named: ['COOL_SWAG_FUSE'] as any,
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "COOL_SWAG_FUSE is not a valid named fuse

      Version: @ensdomains/ensjs@3.0.0-alpha.62"
    `)
  })
})
describe('Number', () => {
  it('should return a setFuses transaction from a number and succeed', async () => {
    const tx = await setFuses(walletClient, {
      name: 'wrapped.eth',
      fuses: {
        number: 113,
      },
      account: accounts[1],
    })
    expect(tx).toBeTruthy()
    const receipt = await waitForTransaction(tx)
    expect(receipt.status).toBe('success')

    const fuses = await getFuses('wrapped.eth')
    checkFuses(fuses, [
      'CANNOT_UNWRAP',
      'CANNOT_CREATE_SUBDOMAIN',
      'CANNOT_SET_TTL',
      'CANNOT_APPROVE',
      'PARENT_CANNOT_CONTROL',
    ])
  })
  it('should throw an error if the number is too high', async () => {
    await expect(
      setFuses(walletClient, {
        name: 'wrapped.eth',
        fuses: {
          number: 4294967297,
        },

        account: accounts[1],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "Fuse value out of range

      - Fuse value: 4294967297
      - Allowed range: 1-4294967296

      Details: Fuse number must be limited to uint32, the supplied value was too high

      Version: @ensdomains/ensjs@3.0.0-alpha.62"
    `)
  })
  it('should throw an error if the number is too low', async () => {
    await expect(
      setFuses(walletClient, {
        name: 'wrapped.eth',
        fuses: {
          number: -1,
        },

        account: accounts[1],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "Fuse value out of range

      - Fuse value: -1
      - Allowed range: 1-4294967296

      Details: Fuse number must be limited to uint32, the supplied value was too low

      Version: @ensdomains/ensjs@3.0.0-alpha.62"
    `)
  })
  it('should throw an error if the number is not an integer', async () => {
    await expect(
      setFuses(walletClient, {
        name: 'wrapped.eth',
        fuses: {
          number: 7.5,
        },

        account: accounts[1],
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      "Fuse was not an integer, which is required

      - Fuse value: 7.5

      Version: @ensdomains/ensjs@3.0.0-alpha.62"
    `)
  })
})
