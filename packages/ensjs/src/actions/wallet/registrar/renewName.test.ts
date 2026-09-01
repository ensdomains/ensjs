import { type Address, encodeFunctionData, zeroHash } from 'viem'
import { beforeAll, expect, it } from 'vitest'
import { getChainContractAddress } from '../../../clients/shared.js'
import {
  deploymentAddresses,
  walletClient,
} from '../../../test/addTestContracts.js'
import { clientWithOverrides } from '../../../utils/clientWithOverrides.js'
import { renewNameWriteParameters } from './renewName.js'

const paymentToken = deploymentAddresses.USDC

let accounts: Address[]

beforeAll(async () => {
  accounts = await walletClient.getAddresses()
})

it('renewNameWriteParameters rejects non-eth-2ld names', () => {
  expect(() =>
    renewNameWriteParameters(
      clientWithOverrides(walletClient, { account: accounts[0] }),
      {
        name: 'foo.bar.eth',
        duration: 31_536_000n,
        paymentToken,
        contract: 'ensEthRenewerV1',
      },
    ),
  ).toThrow()
})

it.each(['ensEthRegistrar', 'ensEthRenewerV1'] as const)(
  'renewNameWriteParameters encodes renew calldata for a 2ld name via %s',
  (contract) => {
    const writeParameters = renewNameWriteParameters(
      clientWithOverrides(walletClient, { account: accounts[0] }),
      {
        name: 'example.eth',
        duration: 31_536_000n,
        paymentToken,
        referrer: zeroHash,
        contract,
      },
    )
    const data = encodeFunctionData({
      abi: writeParameters.abi,
      functionName: writeParameters.functionName,
      args: writeParameters.args,
    })

    expect(data).toMatch(/^0x[0-9a-f]+$/i)
    expect(data.length).toBeGreaterThan(10)
  },
)

it('renewNameWriteParameters routes to the ETHRegistrar for v2 names', () => {
  const { address } = renewNameWriteParameters(
    clientWithOverrides(walletClient, { account: accounts[0] }),
    {
      name: 'example.eth',
      duration: 31_536_000n,
      paymentToken,
      contract: 'ensEthRegistrar',
    },
  )
  expect(address).toBe(deploymentAddresses.ETHRegistrar)
})

it('renewNameWriteParameters routes to the ETHRenewerV1 for v1 names', () => {
  const { address } = renewNameWriteParameters(
    clientWithOverrides(walletClient, { account: accounts[0] }),
    {
      name: 'example.eth',
      duration: 31_536_000n,
      paymentToken,
      contract: 'ensEthRenewerV1',
    },
  )
  expect(address).toBe(
    getChainContractAddress({
      chain: walletClient.chain,
      contract: 'ensEthRenewerV1',
    }),
  )
})
