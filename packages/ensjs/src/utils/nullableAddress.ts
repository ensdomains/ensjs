import { type Address, zeroAddress } from 'viem'

export const nullableAddress = (address: Address) =>
  address === zeroAddress ? null : address
