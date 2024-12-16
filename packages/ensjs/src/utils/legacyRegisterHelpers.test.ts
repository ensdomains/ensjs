import { labelhash } from 'viem'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  isLegacyRegistrationWithConfig,
  normalizeLegacyRegistrationParameters,
  makeLegacyCommitment,
  makeLegacyCommitmentFromTuple,
  makeLegacyCommitmentTuple,
  makeLegacyRegistrationTuple,
  type LegacyRegistrationParameters,
} from './legacyRegisterHelpers.js'
import { EMPTY_ADDRESS } from './consts.js'
import { randomSecret } from './registerHelpers.js'
import { publicClient, walletClient } from '../test/addTestContracts.js'
import { legacyEthRegistrarControllerMakeCommitmentSnippet, legacyEthRegistrarControllerMakeCommitmentWithConfigSnippet } from '../contracts/legacyEthRegistrarController.js'
import { getChainContractAddress } from '../contracts/getChainContractAddress.js'

let accounts: Address[]

beforeAll(async () => {
  accounts = await walletClient.getAddresses()
})

describe('isLegacyRegistrationWithConfig', () => {
  it('return false when no resolverAddress and no address is supplied', () => {
    expect(
      isLegacyRegistrationWithConfig({
        name: 'test.eth',
        owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        duration: 31536000,
        secret: '0xsecret',
      }),
    ).toBe(false)
  })

  it('return false when resolverAddress and address are empty addresses', () => {
    expect(
      isLegacyRegistrationWithConfig({
        name: 'test.eth',
        owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        duration: 31536000,
        secret: '0xsecret',
        resolverAddress: EMPTY_ADDRESS,
        address: EMPTY_ADDRESS,
      }),
    ).toBe(false)
  })

  it('return true when resolverAddress and address are defined', () => {
    expect(
      isLegacyRegistrationWithConfig({
        name: 'test.eth',
        owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        duration: 31536000,
        secret: '0xsecret',
        resolverAddress: '0xresolverAddress',
        address: '0xaddress',
      }),
    ).toBe(true)
  })

  it('return true when resolverAddress is defined and address is NOT defined', () => {
    expect(
      isLegacyRegistrationWithConfig({
        name: 'test.eth',
        owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        duration: 31536000,
        secret: '0xsecret',
        resolverAddress: '0xresolverAddress',
      }),
    ).toBe(true)
  })

  it('return true when address is defined and resolverAddress is NOT defined', () => {
    expect(
      isLegacyRegistrationWithConfig({
        name: 'test.eth',
        owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        duration: 31536000,
        secret: '0xsecret',
        address: '0xaddress',
      }),
    ).toBe(true)
  })
})

describe('normalizeLegacyRegistrationParameters', () => {
  it('should return parameters without config if resolverAddress and address are NOT defined ', () => {
    expect(
      normalizeLegacyRegistrationParameters({
        name: 'test.eth',
        owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        duration: 31536000,
        secret: '0xsecret',
      }),
    ).toEqual({
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      duration: 31536000,
      secret: '0xsecret',
    })
  })

  it('should return parameters without config if resolverAddress and address are empty addresses ', () => {
    expect(
      normalizeLegacyRegistrationParameters({
        name: 'test.eth',
        owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        duration: 31536000,
        secret: '0xsecret',
        resolverAddress: EMPTY_ADDRESS,
        address: EMPTY_ADDRESS,
      }),
    ).toEqual({
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      duration: 31536000,
      secret: '0xsecret',
    })
  })

  it('should return parameters with config if resolverAddress and address are defined ', () => {
    expect(
      normalizeLegacyRegistrationParameters({
        name: 'test.eth',
        owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        duration: 31536000,
        secret: '0xsecret',
        resolverAddress: '0xresolverAddress',
        address: '0xaddress',
      }),
    ).toEqual({
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      duration: 31536000,
      secret: '0xsecret',
      resolverAddress: '0xresolverAddress',
      address: '0xaddress',
    })
  })

  it('should replace address with empty address if it is undefined ', () => {
    expect(
      normalizeLegacyRegistrationParameters({
        name: 'test.eth',
        owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        duration: 31536000,
        secret: '0xsecret',
        resolverAddress: '0xresolverAddress',
      }),
    ).toEqual({
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      duration: 31536000,
      secret: '0xsecret',
      resolverAddress: '0xresolverAddress',
      address: EMPTY_ADDRESS,
    })
  })

  it('should pass through params if empty address is empty address ', () => {
    expect(
      normalizeLegacyRegistrationParameters({
        name: 'test.eth',
        owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        duration: 31536000,
        secret: '0xsecret',
        resolverAddress: '0xresolverAddress',
        address: EMPTY_ADDRESS,
      }),
    ).toEqual({
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      duration: 31536000,
      secret: '0xsecret',
      resolverAddress: '0xresolverAddress',
      address: EMPTY_ADDRESS,
    })
  })

  it('should throw an error if resolverAddress is not defined and address is defined', async () => {
    expect(() =>
      normalizeLegacyRegistrationParameters({
        name: 'test.eth',
        owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        duration: 31536000,
        secret: '0xsecret',
        address: '0xaddress',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [LegacyRegistrationInvalidConfigError: Resolver address is required when setting an address
      
      - resolverAddress: 0x0000000000000000000000000000000000000000
      - addr: 0xaddress
      
      Version: @ensdomains/ensjs@1.0.0-mock.0]
    `)
  })

  it('should throw an error if resolverAddress is empty address and address is defined', async () => {
    expect(() =>
      normalizeLegacyRegistrationParameters({
        name: 'test.eth',
        owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        duration: 31536000,
        secret: '0xsecret',
        resolverAddress: EMPTY_ADDRESS,
        address: '0xaddress',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [LegacyRegistrationInvalidConfigError: Resolver address is required when setting an address
      
      - resolverAddress: 0x0000000000000000000000000000000000000000
      - addr: 0xaddress
      
      Version: @ensdomains/ensjs@1.0.0-mock.0]
    `)
  })
})

describe('makeLegacyCommitmentTuple()', () => {
  it('generates a commitment tuple', () => {
    const tuple = makeLegacyCommitmentTuple({
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      duration: 31536000,
      secret: '0xsecret',
    })
    // labelhash
    expect(tuple[0]).toBe(labelhash('test'))
    // owner
    expect(tuple[1]).toBe('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
    // duration
    expect(tuple[2]).toBe(31536000n)
    // secret
    expect(tuple[3]).toBe('0xsecret')
    // resolver address
    expect(tuple[4]).toBe('0x0000000000000000000000000000000000000000')
    // records
    expect(tuple[5]).toStrictEqual([])
    // reverse record
    expect(tuple[6]).toBe(false)
    // owner controlled fuses
    expect(tuple[7]).toBe(0)
  })
  it('encodes fuses when supplied', () => {
    const tuple = makeLegacyCommitmentTuple({
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      duration: 31536000,
      secret: '0xsecret',
      fuses: {
        named: ['CANNOT_UNWRAP', 'CANNOT_BURN_FUSES'],
      },
    })
    expect(tuple[7]).toBe(3)
  })
  it('adds ETH coin when reverse record is supplied and no ETH coin is supplied', () => {
    const tuple = makeLegacyCommitmentTuple({
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      duration: 31536000,
      secret: '0xsecret',
      reverseRecord: true,
      resolverAddress: '0xresolverAddress',
    })
    expect(tuple[5]).toMatchInlineSnapshot(`
      [
        "0x8b95dd71eb4f647bea6caa36333c816d7b46fdcb05f9466ecacc140ea8c66faf15b3d9f1000000000000000000000000000000000000000000000000000000000000003c00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000014f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000",
      ]
    `)
    expect(tuple[6]).toBe(true)
  })
  it('does not add ETH coin when reverse record is supplied and ETH coin is supplied', () => {
    const tuple = makeLegacyCommitmentTuple({
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      duration: 31536000,
      records: {
        coins: [
          { coin: 'ETH', value: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' },
        ],
      },
      resolverAddress: '0xresolverAddress',
      secret: '0xsecret',
      reverseRecord: true,
    })
    expect(tuple[5]).toMatchInlineSnapshot(`
      [
        "0x8b95dd71eb4f647bea6caa36333c816d7b46fdcb05f9466ecacc140ea8c66faf15b3d9f1000000000000000000000000000000000000000000000000000000000000003c00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000014f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000",
      ]
    `)
    expect(tuple[6]).toBe(true)
  })
  it('throws when records are supplied without a resolver address', () => {
    expect(() =>
      makeLegacyCommitmentTuple({
        name: 'test.eth',
        owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        duration: 31536000,
        records: {
          coins: [
            {
              coin: 'ETH',
              value: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            },
          ],
        },
        secret: '0xsecret',
        reverseRecord: true,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ResolverAddressRequiredError: Resolver address is required when data is supplied

      Supplied data:
      - name: test.eth
      - owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
      - duration: 31536000
      - resolverAddress: 0x0000000000000000000000000000000000000000
      - records: [object Object]
      - reverseRecord: true
      - fuses: undefined

      Version: @ensdomains/ensjs@1.0.0-mock.0]
    `)
  })
})

describe('makeLegacyRegistrationTuple()', () => {
  it('replaces labelhash from commitment tuple with label', () => {
    const data: LegacyRegistrationParameters = {
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      duration: 31536000,
      secret: '0xsecret',
    }
    const commitmentTuple = makeLegacyCommitmentTuple(data)
    const registrationTuple = makeLegacyRegistrationTuple(data)
    expect(registrationTuple[0]).toBe('test')
    expect(registrationTuple.slice(1)).toEqual(commitmentTuple.slice(1))
  })
})

describe('makeLegacyCommitment', () => {
  it('should match a commitment generated from makeCommitment', async () => {
    const secret = randomSecret()
    const params = {
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      duration: 31536000,
      secret,
    } as const
    const commitment = makeLegacyCommitment(params)

    const commitment2 = await publicClient.readContract({
      abi: legacyEthRegistrarControllerMakeCommitmentSnippet,
      functionName: 'makeCommitment',
      address: getChainContractAddress({
        client: publicClient,
        contract: 'legacyEthRegistrarController',
      }),
      args: makeLegacyCommitmentTuple(params),
    })

    expect(commitment).toBe(commitment2)
  })

  it.only('should match a commitment generated from makeCommitmentWithConfig', async () => {
    const secret = randomSecret()
    const params = {
      name: 'test.eth',
      owner: accounts[0],
      duration: 31536000,
      secret,
      resolverAddress: getChainContractAddress({
        client: publicClient,
        contract: 'legacyPublicResolver',
      }),
      address: accounts[1],
    } as const

    console.log('params', params)
    console.log('makeLegacyCommitmentTuple', makeLegacyCommitmentTuple(params))
    const commitment = makeLegacyCommitment(params)

    const commitment2 = await publicClient.readContract({
      abi: legacyEthRegistrarControllerMakeCommitmentWithConfigSnippet,
      functionName: 'makeCommitmentWithConfig',
      address: getChainContractAddress({
        client: publicClient,
        contract: 'legacyEthRegistrarController',
      }),
      args: makeLegacyCommitmentTuple(params),
    })

    expect(commitment).toBe(commitment2)
    console.log(commitment)
  })
})

describe('makeLegacyCommitment()', () => {
  it('generates a commitment from a RegistrationParameters', () => {
    const commitment = makeLegacyCommitment({
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      duration: 31536000,
      secret:
        '0xde99acb8241826c5b3012b2c7a05dc28043428744a9c39445b4707c92b3fc054',
    })
    expect(commitment).toMatchInlineSnapshot(
      `"0x0d7fe28313600187945700f6c6374cc0ba4a360df039b3e62d435506e69dbe63"`,
    )
  })
})
