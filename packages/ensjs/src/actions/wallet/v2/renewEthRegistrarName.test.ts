import { type Address, zeroHash } from 'viem'
import { expect, it } from 'vitest'
import { encodeRenewEthRegistrarNameData } from './renewEthRegistrarName.js'

const token = '0x302edecc2b8d1f3f4625b8a825a42f9adc102e65' as Address

it('encodeRenewEthRegistrarNameData rejects non-eth-2ld names', () => {
  expect(() =>
    encodeRenewEthRegistrarNameData({
      name: 'foo.bar.eth',
      duration: 31_536_000n,
      paymentToken: token,
    }),
  ).toThrow()
})

it('encodeRenewEthRegistrarNameData produces calldata for a 2ld name', () => {
  const data = encodeRenewEthRegistrarNameData({
    name: 'example.eth',
    duration: 31_536_000,
    paymentToken: token,
    referrer: zeroHash,
  })
  expect(data).toMatch(/^0x[0-9a-f]+$/i)
  expect(data.length).toBeGreaterThan(10)
})
