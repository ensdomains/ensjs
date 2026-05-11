import { type Address, zeroHash } from 'viem'
import { expect, it } from 'vitest'
import { encodeRenewNameData } from './renewName.js'

const token = '0x302edecc2b8d1f3f4625b8a825a42f9adc102e65' as Address

it('encodeRenewNameData rejects non-eth-2ld names', () => {
  expect(() =>
    encodeRenewNameData({
      name: 'foo.bar.eth',
      duration: 31_536_000n,
      paymentToken: token,
    }),
  ).toThrow()
})

it('encodeRenewNameData produces calldata for a 2ld name', () => {
  const data = encodeRenewNameData({
    name: 'example.eth',
    duration: 31_536_000,
    paymentToken: token,
    referrer: zeroHash,
  })
  expect(data).toMatch(/^0x[0-9a-f]+$/i)
  expect(data.length).toBeGreaterThan(10)
})
