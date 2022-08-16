import { ethers } from 'ethers'
import { ENS } from '..'
import type { ETHRegistrarController, PublicResolver } from '../generated'
import setup from '../tests/setup'
import {
  makeCommitment,
  makeCommitmentData,
  makeRegistrationData,
  randomSecret,
  RegistrationParams,
} from '../utils/registerHelpers'

let ENSInstance: ENS
let provider: ethers.providers.JsonRpcProvider
let accounts: string[]
let publicResolver: PublicResolver
let controller: ETHRegistrarController
let baseData: Partial<RegistrationParams>

beforeAll(async () => {
  ;({ ENSInstance, provider } = await setup())
  accounts = await provider.listAccounts()
  publicResolver = await ENSInstance.contracts!.getPublicResolver()!
  controller = await ENSInstance.contracts!.getEthRegistrarController()!
  baseData = {
    name: 'test.eth',
    owner: accounts[1],
    duration: 31536000,
    resolver: publicResolver,
  }
})

describe('registerHelpers', () => {
  const secret = randomSecret()
  describe('makeCommitment', () => {
    it('should match function call', async () => {
      const result = makeCommitment({
        ...baseData,
        secret,
        wrapperExpiry: 100000,
      } as any)
      const fetched = await controller.makeCommitment(
        baseData.name!.split('.')[0],
        baseData.owner!,
        baseData.duration!,
        secret,
        baseData.resolver!.address!,
        [],
        false,
        0,
        100000,
      )
      expect(fetched).toBe(result.commitment)
    })
    it('should return secret, commitment, and wrapper expiry', () => {
      const result = makeCommitment(baseData as any)
      expect(result).toHaveProperty('secret')
      expect(result).toHaveProperty('commitment')
      expect(result).toHaveProperty('wrapperExpiry')
    })
    it('should allow a custom secret', () => {
      const result = makeCommitment({
        ...baseData,
        secret,
      } as any)
      expect(result).toHaveProperty('secret', secret)
    })
  })
  describe('makeCommitmentData', () => {
    it('should add ETH record if reverseRecord is true and no records', () => {
      const result = makeCommitmentData({
        ...baseData,
        secret,
        reverseRecord: true,
      } as any)
      expect(result[4]).not.toStrictEqual([])
    })
    it('should allow custom wrapper expiry', () => {
      const result = makeCommitmentData({
        ...baseData,
        secret,
        wrapperExpiry: 100,
      } as any)
      expect(result[8]).toBe(100)
    })
    it('should return empty data if no reverse record and no records', () => {
      const result = makeCommitmentData({
        ...baseData,
        secret,
      } as any)
      expect(result[4]).toStrictEqual([])
    })
  })
  describe('makeRegistrationData', () => {
    it('should return registration data with the first item being the label', () => {
      const result = makeRegistrationData({
        ...baseData,
        secret,
        wrapperExpiry: 1000,
        duration: 1000,
      } as any)
      expect(result[0]).toBe('test')
    })
  })
})
