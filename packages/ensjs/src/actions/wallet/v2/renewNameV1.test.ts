import { type Address, encodeFunctionData, zeroHash } from 'viem'
import { beforeAll, expect, it } from 'vitest'
import {
  deploymentAddresses,
  walletClient,
} from '../../../test/addTestContracts.js'
import { clientWithOverrides } from '../../../utils/clientWithOverrides.js'
import { renewNameV1WriteParameters } from './renewNameV1.js'

const paymentToken = deploymentAddresses.USDC

let accounts: Address[]

beforeAll(async () => {
  accounts = await walletClient.getAddresses()
})

it('renewNameV1WriteParameters rejects non-eth-2ld names', () => {
  expect(() =>
    renewNameV1WriteParameters(
      clientWithOverrides(walletClient, { account: accounts[0] }),
      {
        name: 'foo.bar.eth',
        duration: 31_536_000n,
        paymentToken,
      },
    ),
  ).toThrow()
})

it('renewNameV1WriteParameters encodes renew calldata for a 2ld name', () => {
  const writeParameters = renewNameV1WriteParameters(
    clientWithOverrides(walletClient, { account: accounts[0] }),
    {
      name: 'example.eth',
      duration: 31_536_000,
      paymentToken,
      referrer: zeroHash,
    },
  )
  const data = encodeFunctionData({
    abi: writeParameters.abi,
    functionName: writeParameters.functionName,
    args: writeParameters.args,
  })

  expect(data).toMatch(/^0x[0-9a-f]+$/i)
  expect(data.length).toBeGreaterThan(10)
})
