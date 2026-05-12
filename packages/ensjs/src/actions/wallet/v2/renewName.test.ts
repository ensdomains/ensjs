import {
  type Address,
  createWalletClient,
  encodeFunctionData,
  http,
  zeroHash,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'
import { expect, it } from 'vitest'
import { extendChainWithEns } from '../../../clients/l1.js'
import { renewNameWriteParameters } from './renewName.js'

const token = '0x302edecc2b8d1f3f4625b8a825a42f9adc102e65' as Address

const chain = extendChainWithEns(sepolia)
const account = privateKeyToAccount(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const walletClient = createWalletClient({
  chain,
  transport: http(),
  account,
})

function encodeRenewCalldata(
  parameters: Parameters<typeof renewNameWriteParameters>[1],
) {
  const wp = renewNameWriteParameters(walletClient, parameters)
  return encodeFunctionData({
    abi: wp.abi,
    functionName: wp.functionName,
    args: wp.args,
  })
}

it('renewNameWriteParameters rejects non-eth-2ld names', () => {
  expect(() =>
    encodeRenewCalldata({
      name: 'foo.bar.eth',
      duration: 31_536_000n,
      paymentToken: token,
    }),
  ).toThrow()
})

it('renewNameWriteParameters encodes renew calldata for a 2ld name', () => {
  const data = encodeRenewCalldata({
    name: 'example.eth',
    duration: 31_536_000,
    paymentToken: token,
    referrer: zeroHash,
  })
  expect(data).toMatch(/^0x[0-9a-f]+$/i)
  expect(data.length).toBeGreaterThan(10)
})
