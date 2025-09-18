import { type Address, type Hex, labelhash } from 'viem'
import { describe, expect, it } from 'vitest'
import { ethRegistrarControllerMakeCommitmentSnippet } from '../contracts/ethRegistrarController.js'
import { getChainContractAddress } from '../contracts/getChainContractAddress.js'
import { publicClient } from '../test/addTestContracts.js'
import { namehash } from './normalise.js'
import {
  type RegistrationParameters,
  makeCommitment,
  makeCommitmentFromTuple,
  makeCommitmentTuple,
  makeRegistrationCallData,
  makeRegistrationTuple,
  randomSecret,
} from './registerHelpers.js'

describe('randomSecret()', () => {
  it('generates a random secret with no args', () => {
    const secret = randomSecret()
    expect(secret).toHaveLength(66)
  })
  it('generates a random secret with a platform domain', () => {
    const hash = namehash('test.eth')
    const secret = randomSecret({ platformDomain: 'test.eth' })
    expect(secret).toHaveLength(66)
    expect(secret.slice(2, 10)).toEqual(hash.slice(2, 10))
  })
  it('generates a random secret with a campaign', () => {
    const secret = randomSecret({ campaign: 1 })
    expect(secret).toHaveLength(66)
    expect(secret.slice(10, 18)).toEqual('00000001')
  })
  it('throws when campaign is too large', () => {
    expect(() =>
      randomSecret({ campaign: 0xffffffff + 1 }),
    ).toThrowErrorMatchingInlineSnapshot(`
        [CampaignReferenceTooLargeError: Campaign reference 4294967296 is too large

        - Max campaign reference: 4294967295

        Version: @ensdomains/ensjs@1.0.0-mock.0]
      `)
  })
})

describe('makeCommitmentTuple()', () => {
  it('generates a commitment tuple', () => {
    const tuple = makeCommitmentTuple({
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
    expect(tuple[6]).toBe(0)
    // referrer
    expect(tuple[7]).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    )
  })
  it('adds ETH coin when reverse record is supplied and no ETH coin is supplied', () => {
    const tuple = makeCommitmentTuple({
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      duration: 31536000,
      secret: '0xsecret',
      reverseRecord: 1,
      resolverAddress: '0xresolverAddress',
    })
    expect(tuple[5]).toMatchInlineSnapshot(`
      [
        "0x8b95dd71eb4f647bea6caa36333c816d7b46fdcb05f9466ecacc140ea8c66faf15b3d9f1000000000000000000000000000000000000000000000000000000000000003c00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000014f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000",
      ]
    `)
    expect(tuple[6]).toBe(1)
  })
  it('does not add ETH coin when reverse record is supplied and ETH coin is supplied', () => {
    const tuple = makeCommitmentTuple({
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
      reverseRecord: 1,
    })
    expect(tuple[5]).toMatchInlineSnapshot(`
      [
        "0x8b95dd71eb4f647bea6caa36333c816d7b46fdcb05f9466ecacc140ea8c66faf15b3d9f1000000000000000000000000000000000000000000000000000000000000003c00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000014f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000",
      ]
    `)
    expect(tuple[6]).toBe(1)
  })
  it('throws when records are supplied without a resolver address', () => {
    expect(() =>
      makeCommitmentTuple({
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
        reverseRecord: 1,
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ResolverAddressRequiredError: Resolver address is required when data is supplied

      Supplied data:
      - name: test.eth
      - owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
      - duration: 31536000
      - resolverAddress: 0x0000000000000000000000000000000000000000
      - records: [object Object]
      - reverseRecord: 1

      Version: @ensdomains/ensjs@1.0.0-mock.0]
    `)
  })
})

describe('makeRegistrationTuple()', () => {
  it('replaces labelhash from commitment tuple with label', () => {
    const data: RegistrationParameters = {
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      duration: 31536000,
      secret: '0xsecret',
    }
    const commitmentTuple = makeCommitmentTuple(data)
    const registrationTuple = makeRegistrationTuple(data)
    expect(registrationTuple[0]).toBe('test')
    expect(registrationTuple.slice(1)).toEqual(commitmentTuple.slice(1))
  })
})

describe('makeCommitmentFromTuple()', () => {
  it('generates a commitment from a tuple', () => {
    const tuple = makeCommitmentTuple({
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      duration: 31536000,
      secret:
        '0xde99acb8241826c5b3012b2c7a05dc28043428744a9c39445b4707c92b3fc054',
    })
    const commitment = makeCommitmentFromTuple(tuple)
    expect(commitment).toMatchInlineSnapshot(
      `"0x0d7fe28313600187945700f6c6374cc0ba4a360df039b3e62d435506e69dbe63"`,
    )
  })
})

describe('makeCommitment()', () => {
  it('generates a commitment from a RegistrationParameters', async () => {
    const parameters: RegistrationParameters = {
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as Address,
      duration: 31536000,
      secret:
        '0xde99acb8241826c5b3012b2c7a05dc28043428744a9c39445b4707c92b3fc054',
    }

    const parameters2 = {
      label: 'test',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as Address,
      duration: 31536000n,
      secret:
        '0xde99acb8241826c5b3012b2c7a05dc28043428744a9c39445b4707c92b3fc054' as Hex,
      resolver: getChainContractAddress({
        client: publicClient,
        contract: 'ensPublicResolver',
      }),
      data: [],
      reverseRecord: 0,
      referrer:
        '0xde99acb8241826c5b3012b2c7a05dc28043428744a9c39445b4707c92b3fc054' as Hex,
    }

    const commitment = makeCommitment(parameters)

    console.log(
      'address',
      getChainContractAddress({
        client: publicClient,
        contract: 'ensEthRegistrarController',
      }),
    )

    console.log('commitment', commitment)

    const commitment2 = await publicClient.readContract({
      abi: ethRegistrarControllerMakeCommitmentSnippet,
      functionName: 'makeCommitment',
      address: getChainContractAddress({
        client: publicClient,
        contract: 'ensEthRegistrarController',
      }),
      args: [makeRegistrationCallData(parameters)],
    })

    console.log('commitment2', commitment2)
    expect(commitment).toEqual(commitment2)
  })
})
