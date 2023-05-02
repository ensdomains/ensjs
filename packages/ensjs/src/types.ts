import type {
  Account,
  SendTransactionParameters,
  TransactionRequest,
} from 'viem'
import { ChainWithEns } from './contracts/addContracts'

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type SimpleTransactionRequest = Prettify<
  Required<Pick<TransactionRequest, 'to' | 'data'>>
>

export type TransactionRequestWithPassthrough = SimpleTransactionRequest & {
  passthrough?: any
}

export type WriteTransactionParameters<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
> = Pick<
  SendTransactionParameters<TChain, TAccount, TChainOverride>,
  | 'gas'
  | 'gasPrice'
  | 'maxFeePerGas'
  | 'maxPriorityFeePerGas'
  | 'nonce'
  | 'account'
>

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

export type AnyDate = string | number | bigint | Date
