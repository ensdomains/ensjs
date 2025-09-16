import { describe, expect, it } from 'vitest'
import { namehash } from './normalise.js'
import {
  type RegistrationParameters,
  createCommitmentHash,
  createCommitmentHashWithDefaults,
  registrationParametersWithDefaults,
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
      [CampaignReferenceTooLargeError: Campaign reference is too large

        - Max campaign reference: 4294967295

        Version: @ensdomains/ensjs@1.0.0-mock.0]
      `)
  })
})

describe('registrationParametersWithDefaults()', () => {
  it('generates prepared registration parameters', () => {
    const params = registrationParametersWithDefaults({
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      duration: 31536000,
      secret: '0xsecret',
    })
    // label (not labelhash)
    expect(params.label).toBe('test')
    // owner
    expect(params.owner).toBe('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
    // duration
    expect(params.duration).toBe(31536000n)
    // secret
    expect(params.secret).toBe('0xsecret')
    // resolver address
    expect(params.resolver).toBe('0x0000000000000000000000000000000000000000')
    // records data
    expect(params.data).toStrictEqual([])
    // reverse record
    expect(params.reverseRecord).toBe(0)
    // referrer defaults to zeroHash
    expect(params.referrer).toBe('0x0000000000000000000000000000000000000000000000000000000000000000')
  })

  it('handles referrer when supplied', () => {
    const params = registrationParametersWithDefaults({
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      duration: 31536000,
      secret: '0xsecret',
      referrer: '0x0000000000000000000000000000000000000000000000000000000000000001',
    })
    expect(params.referrer).toBe('0x0000000000000000000000000000000000000000000000000000000000000001')
  })

  it('adds ETH coin when reverse record is supplied and no ETH coin is supplied', () => {
    const params = registrationParametersWithDefaults({
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      duration: 31536000,
      secret: '0xsecret',
      reverseRecord: ['ethereum'],
      resolverAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    })
    // Should add ETH coin data
    expect(params.data).toMatchInlineSnapshot(
      `
      [
        "0xac9650d8000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008434c3e9a2000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb9226600000000000000000000000000000000000000000000000000000000",
      ]
    `,
    )
    // Should set reverse record bitmask for ethereum
    expect(params.reverseRecord).toBe(1)
  })

  it('does not add ETH coin when reverse record is supplied and ETH coin is supplied', () => {
    const params = registrationParametersWithDefaults({
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      duration: 31536000,
      secret: '0xsecret',
      reverseRecord: ['ethereum'],
      resolverAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      records: {
        coins: [
          {
            coin: 60,
            value: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
          },
        ],
      },
    })
    expect(params.data).toMatchInlineSnapshot(
      `
      [
        "0xac9650d8000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008434c3e9a2000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000003c44cdddb6a900fa2b585dd299e03d12fa4293bc00000000000000000000000000000000000000000000000000000000",
      ]
    `,
    )
  })

  it('throws when records are supplied without a resolver address', () => {
    expect(() =>
      registrationParametersWithDefaults({
        name: 'test.eth',
        owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        duration: 31536000,
        secret: '0xsecret',
        records: {
          texts: [{ key: 'text', value: 'text' }],
        },
        reverseRecord: ['default'],
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      [ResolverAddressRequiredError: Resolver address is required when data is supplied

      Supplied data:
      - name: test.eth
      - owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
      - duration: 31536000
      - resolverAddress: 0x0000000000000000000000000000000000000000
      - records: [object Object]
      - reverseRecord: default
      - referrer: 0x0000000000000000000000000000000000000000000000000000000000000000

      Version: @ensdomains/ensjs@1.0.0-mock.0]
    `)
  })
})

describe('createCommitmentHash()', () => {
  it('generates a commitment hash from prepared parameters', () => {
    const params = registrationParametersWithDefaults({
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      duration: 31536000,
      secret:
        '0xde99acb8241826c5b3012b2c7a05dc28043428744a9c39445b4707c92b3fc054',
    })
    const commitment = createCommitmentHash(params)
    expect(commitment).toMatchInlineSnapshot(
      `"0xc1151ff666bc5bf4f528ebe1bf63f0cc0e03e95de23dd982cbda6e25de59cadf"`,
    )
  })
})

describe('createCommitmentHashWithDefaults()', () => {
  it('generates a commitment hash from RegistrationParameters', () => {
    const commitment = createCommitmentHashWithDefaults({
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      duration: 31536000,
      secret:
        '0xde99acb8241826c5b3012b2c7a05dc28043428744a9c39445b4707c92b3fc054',
    })
    expect(commitment).toMatchInlineSnapshot(
      `"0xc1151ff666bc5bf4f528ebe1bf63f0cc0e03e95de23dd982cbda6e25de59cadf"`,
    )
  })
})