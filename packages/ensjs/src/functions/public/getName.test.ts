import {
  type Address,
  type Hex,
  RawContractError,
  bytesToHex,
  encodeErrorResult,
  labelhash,
  namehash,
} from 'viem'
import { writeContract } from 'viem/actions'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { ClientWithEns } from '../../contracts/consts.js'
import { publicResolverSetAddrSnippet } from '../../contracts/publicResolver.js'
import { registrySetSubnodeRecordSnippet } from '../../contracts/registry.js'
import { universalResolverErrors } from '../../contracts/universalResolver.js'
import {
  deploymentAddresses,
  publicClient,
  testClient,
  waitForTransaction,
  walletClient,
} from '../../test/addTestContracts.js'
import { packetToBytes } from '../../utils/hexEncodedName.js'
import setPrimaryName from '../wallet/setPrimaryName.js'
import getName from './getName.js'

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

describe('getName', () => {
  it('should get a primary name from an address', async () => {
    const result = await getName(publicClient, {
      address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "match": true,
        "name": "with-profile.eth",
        "resolverAddress": "${deploymentAddresses.LegacyPublicResolver}",
        "reverseResolverAddress": "${deploymentAddresses.PublicResolver}",
      }
    `)
  })
  it('should return null for an address with no primary name', async () => {
    const result = await getName(publicClient, {
      address: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0',
    })
    expect(result).toBeNull()
  })
  it('should return null for a name with no forward resolution when allowMismatch is false', async () => {
    const tx = await setPrimaryName(walletClient, {
      name: 'with-profile.eth',
      account: accounts[0],
    })
    await waitForTransaction(tx)

    const result = await getName(publicClient, {
      address: accounts[0],
    })
    expect(result).toBeNull()
  })
  it('should return with a false match for a name with no forward resolution when allowMismatch is true', async () => {
    const tx = await setPrimaryName(walletClient, {
      name: 'with-profile.eth',
      account: accounts[0],
    })
    await waitForTransaction(tx)

    const result = await getName(publicClient, {
      address: accounts[0],
      allowMismatch: true,
    })
    expect(result).toMatchInlineSnapshot(`
      {
        "match": false,
        "name": "with-profile.eth",
        "resolverAddress": "0x0000000000000000000000000000000000000000",
        "reverseResolverAddress": "0x0000000000000000000000000000000000000000",
      }
    `)
  })
  it('should return null on error when strict is false', async () => {
    await expect(
      getName.decode(
        {} as ClientWithEns,
        new RawContractError({
          data: encodeErrorResult({
            abi: universalResolverErrors,
            errorName: 'ResolverNotFound',
            args: [
              bytesToHex(packetToBytes(`${accounts[0].slice(2)}.addr.reverse`)),
            ],
          }),
        }),
        {
          address: '0x1234567890abcdef',
          args: ['0x', 60n],
        },
        {
          address: accounts[0],
          allowMismatch: true,
          strict: false,
        },
      ),
    ).resolves.toBeNull()
  })
  it('should throw on error when strict is true', async () => {
    await expect(
      getName.decode(
        {} as ClientWithEns,
        new RawContractError({
          data: encodeErrorResult({
            abi: universalResolverErrors,
            errorName: 'ResolverNotFound',
            args: [
              bytesToHex(packetToBytes(`${accounts[0].slice(2)}.addr.reverse`)),
            ],
          }),
        }),
        {
          address: '0x1234567890abcdef',
          args: ['0x', 60n],
        },
        {
          address: accounts[0],
          allowMismatch: true,
          strict: true,
        },
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ContractFunctionExecutionError: The contract function "reverse" reverted.

      Error: ResolverNotFound(bytes name)
                             (0x28663339466436653531616164383846364634636536614238383237323739636666466239323236360461646472077265766572736500)
       
      Contract Call:
        address:   0x1234567890abcdef
        function:  reverse(bytes encodedAddress, uint256 coinType)
        args:             (0x, 60)

      Version: viem@2.30.6]
    `)
  })
  it('should not return unnormalised name', async () => {
    const tx1 = await writeContract(walletClient, {
      abi: registrySetSubnodeRecordSnippet,
      account: accounts[2],
      address: deploymentAddresses.ENSRegistry,
      functionName: 'setSubnodeRecord',
      args: [
        namehash('with-profile.eth'),
        labelhash('suB'),
        accounts[0],
        deploymentAddresses.PublicResolver,
        0n,
      ],
    })
    await waitForTransaction(tx1)
    const tx2 = await writeContract(walletClient, {
      abi: publicResolverSetAddrSnippet,
      account: accounts[0],
      address: deploymentAddresses.PublicResolver,
      functionName: 'setAddr',
      args: [namehash('suB.with-profile.eth'), 60n, accounts[0]],
    })
    await waitForTransaction(tx2)
    const tx3 = await setPrimaryName(walletClient, {
      name: 'suB.with-profile.eth',
      account: accounts[0],
    })
    await waitForTransaction(tx3)

    // Should throw NameNotNormalisedError
    await expect(
      getName(publicClient, {
        address: accounts[0],
        strict: true,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [NameNotNormalisedError: Name suB.with-profile.eth resolved from address is not normalised

      - Resolved from address: 0x82e01223d51Eb87e16A03E24687EDF0F294da6f1
      Resolved for coinType: 60

      Version: @ensdomains/ensjs@1.0.0-mock.0]
    `)

    // should return null when strict is false
    await expect(
      getName(publicClient, {
        address: accounts[0],
        strict: false,
      }),
    ).resolves.toBeNull()
  })
})
