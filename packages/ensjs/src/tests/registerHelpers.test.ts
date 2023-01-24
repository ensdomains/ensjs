import { ethers } from 'ethers'
import { ENS } from '..'
import type { ETHRegistrarController, PublicResolver } from '../generated'
import {
  makeCommitment,
  makeCommitmentData,
  makeRegistrationData,
  randomSecret,
  RegistrationParams,
} from '../utils/registerHelpers'
import setup from './setup'

let ensInstance: ENS
let provider: ethers.providers.JsonRpcProvider
let accounts: string[]
let publicResolver: PublicResolver
let controller: ETHRegistrarController
let baseData: Partial<RegistrationParams>

beforeAll(async () => {
  ;({ ensInstance, provider } = await setup())
  accounts = await provider.listAccounts()
  publicResolver = await ensInstance.contracts!.getPublicResolver()!
  controller = await ensInstance.contracts!.getEthRegistrarController()!
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
      )
      expect(fetched).toBe(result.commitment)
    })
    it('should return secret, commitment, and wrapper expiry', () => {
      const result = makeCommitment(baseData as any)
      expect(result).toHaveProperty('secret')
      expect(result).toHaveProperty('commitment')
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
    it('should return empty data if no reverse record and no records', () => {
      const result = makeCommitmentData({
        ...baseData,
        secret,
      } as any)
      expect(result[5]).toStrictEqual([])
    })
  })
  describe('makeRegistrationData', () => {
    it('should return registration data with the first item being the label', () => {
      const result = makeRegistrationData({
        ...baseData,
        secret,
        duration: 1000,
      } as any)
      expect(result[0]).toBe('test')
    })
  })
})
