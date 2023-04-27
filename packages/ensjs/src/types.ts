import { Address, Hex } from 'viem'

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type TransactionRequest = {
  to: Address
  data: Hex
}

export type TransactionRequestWithPassthrough = TransactionRequest & {
  passthrough?: any
}
