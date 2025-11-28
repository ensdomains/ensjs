import { type Address, type Hex } from 'viem'
import { describe, expect, it } from 'vitest'
import { ethRegistrarControllerMakeCommitmentSnippet } from '../contracts/ethRegistrarController.js'
import { getChainContractAddress } from '../contracts/getChainContractAddress.js'
import { publicClient } from '../test/addTestContracts.js'
import { namehash } from './normalise.js'
import {
  type RegistrationParameters,
  makeCommitment,
  makeRegistrationCallData,
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

describe('makeCommitment()', () => {
  it('generates a commitment from a RegistrationParameters', async () => {
    const parameters: RegistrationParameters = {
      name: 'test.eth',
      owner: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as Address,
      duration: 31536000,
      secret:
        '0xde99acb8241826c5b3012b2c7a05dc28043428744a9c39445b4707c92b3fc054' as Hex,
    }

    const commitment = makeCommitment(parameters)

    const commitment2 = await publicClient.readContract({
      abi: ethRegistrarControllerMakeCommitmentSnippet,
      functionName: 'makeCommitment',
      address: getChainContractAddress({
        client: publicClient,
        contract: 'ensEthRegistrarController',
      }),
      args: [makeRegistrationCallData(parameters)],
    })

    expect(commitment).toEqual(commitment2)
  })
})
