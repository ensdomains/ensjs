import type { TransactionRequest } from 'viem'

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type SimpleTransactionRequest = Prettify<
  Required<Pick<TransactionRequest, 'to' | 'data'>>
>

export type TransactionRequestWithPassthrough = SimpleTransactionRequest & {
  passthrough?: any
}

export type DateWithValue<T> = {
  date: Date
  value: T
}

export type DecodedAbi = {
  contentType: 1 | 2 | 4 | 8 | number
  decoded: boolean
  abi: string | object
}

export type DecodedAddr = {
  id: number
  name: string
  addr: string
}

export type DecodedText = {
  key: string
  value: string
}
