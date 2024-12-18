import { type Address, type Hex } from 'viem'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  isLegacyRegistrationWithConfig,
  makeLegacyCommitment,
  makeLegacyCommitmentTuple,
  makeLegacyRegistrationTuple,
  type LegacyRegistrationParameters,
} from './legacyRegisterHelpers.js'
import { EMPTY_ADDRESS } from './consts.js'
import { randomSecret } from './registerHelpers.js'
import { publicClient, walletClient } from '../test/addTestContracts.js'
import {
  legacyEthRegistrarControllerMakeCommitmentSnippet,
  legacyEthRegistrarControllerMakeCommitmentWithConfigSnippet,
} from '../contracts/legacyEthRegistrarController.js'
import { getChainContractAddress } from '../contracts/getChainContractAddress.js'

let accounts: Address[]
let resolverAddress: Address
let secret: Hex
let owner: Address
let address: Address
const duration = 31536000
const name = 'test.eth'
const makeSnapshot = (addr: Address) => `
      [LegacyRegistrationInvalidConfigError: Resolver address is required when setting an address
      
      - resolverAddress: 0x0000000000000000000000000000000000000000
      - addr: ${addr}
      
      Version: @ensdomains/ensjs@1.0.0-mock.0]
      `

beforeAll(async () => {
  accounts = await walletClient.getAddresses()
  resolverAddress = getChainContractAddress({
    client: publicClient,
    contract: 'legacyPublicResolver',
  })
  secret = randomSecret()
  ;[owner, address] = accounts
})

describe('isLegacyRegistrationWithConfig', () => {
  it('return false when resolverAddress and address are undefined', () => {
    expect(
      isLegacyRegistrationWithConfig({
        name,
        owner,
        duration,
        secret,
      }),
    ).toBe(false)
  })

  it('return false when resolverAddress and address are empty addresses', () => {
    expect(
      isLegacyRegistrationWithConfig({
        name,
        owner,
        duration,
        secret,
        resolverAddress: EMPTY_ADDRESS,
        address: EMPTY_ADDRESS,
      }),
    ).toBe(false)
  })

  it('return true when resolverAddress and address are defined', () => {
    expect(
      isLegacyRegistrationWithConfig({
        name,
        owner,
        duration,
        secret,
        resolverAddress,
        address,
      }),
    ).toBe(true)
  })

  it('return true when resolverAddress is defined and address is NOT defined', () => {
    expect(
      isLegacyRegistrationWithConfig({
        name,
        owner,
        duration,
        secret,
        resolverAddress,
      }),
    ).toBe(true)
  })

  it('should throw an error when address is defined and resolverAddress is NOT defined', () => {
    expect(() =>
      isLegacyRegistrationWithConfig({
        name,
        owner,
        duration,
        secret,
        address,
      }),
    ).toThrowErrorMatchingInlineSnapshot(makeSnapshot(address))
  })

  it('should throw an error when address is defined and resolverAddress is empty address', () => {
    expect(() =>
      isLegacyRegistrationWithConfig({
        name,
        owner,
        duration,
        secret,
        resolverAddress: EMPTY_ADDRESS,
        address,
      }),
    ).toThrowErrorMatchingInlineSnapshot(makeSnapshot(address))
  })
})

describe('makeLegacyCommitmentTuple', () => {
  it('should return args for makeCommit if resolverAddress and address are undefined', () => {
    const tuple = makeLegacyCommitmentTuple({
      name: 'test.eth',
      owner,
      duration,
      secret,
    })
    expect(tuple).toEqual(['test', owner, secret])
  })

  it('should return args for makeCommitWithConfig if resolverAddress is defined', () => {
    const tuple = makeLegacyCommitmentTuple({
      name: 'test.eth',
      owner,
      duration,
      secret,
      resolverAddress,
    })
    expect(tuple).toEqual([
      'test',
      owner,
      secret,
      resolverAddress,
      EMPTY_ADDRESS,
    ])
  })

  it('should throw error if resolverAddress is NOT defined and address is defined', () => {
    expect(() =>
      makeLegacyCommitmentTuple({
        name: 'test.eth',
        owner,
        duration,
        secret,
        address,
      }),
    ).toThrowErrorMatchingInlineSnapshot(makeSnapshot(address))
  })
})

describe('makeLegacyRegistrationTuple', () => {
  it('should return args for register if resolverAddress and address or undefined', () => {
    const params: LegacyRegistrationParameters = {
      name: 'test.eth',
      owner: accounts[0],
      duration: 31536000,
      secret,
    }
    expect(makeLegacyRegistrationTuple(params)).toEqual([
      'test',
      accounts[0],
      31536000n,
      secret,
    ])
  })

  it('should return args for register if resolverAddress and address are empty addresses', () => {
    const params: LegacyRegistrationParameters = {
      name,
      owner,
      duration,
      secret,
      resolverAddress: EMPTY_ADDRESS,
      address: EMPTY_ADDRESS,
    }
    expect(makeLegacyRegistrationTuple(params)).toEqual([
      'test',
      owner,
      31536000n,
      secret,
    ])
  })

  it('should return args for register if resolverAddress and address are not undefined', () => {
    const params: LegacyRegistrationParameters = {
      name: 'test.eth',
      owner,
      duration,
      secret,
      resolverAddress,
      address,
    }
    expect(makeLegacyRegistrationTuple(params)).toEqual([
      'test',
      owner,
      31536000n,
      secret,
      resolverAddress,
      address,
    ])
  })
})

describe('makeLegacyCommitment', () => {
  it('should match a commitment generated from makeCommitment', async () => {
    const params = {
      name,
      owner,
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

  it('should match a commitment generated from makeCommitmentWithConfig', async () => {
    const params = {
      name,
      owner,
      duration,
      secret,
      resolverAddress,
      address,
    } as const

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
  })
})
