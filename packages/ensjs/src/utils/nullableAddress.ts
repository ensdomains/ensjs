import { zeroAddress, type Address } from 'viem'

export const nullableAddress = (address: Address) =>
  address === zeroAddress ? null : address
