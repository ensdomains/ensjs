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
  value: string
}

export type DecodedText = {
  key: string
  value: string
}

export type AnyDate = string | number | bigint | Date

export type RootName = ''
export type TldName = `${string}`
export type EthTldName = `eth`
export type Eth2ldName = `${string}.eth`
export type EthAnyName = EthTldName | Eth2ldName
export type EthSubname = `${string}.${string}.eth`
export type Other2ldName = `${string}.${string}`
export type OtherSubname = `${string}.${string}.${string}`

export type NameOption =
  | TldName
  | Eth2ldName
  | EthSubname
  | Other2ldName
  | OtherSubname

export type TldNameSpecifier = 'tld'
export type Eth2ldNameSpecifier = 'eth-2ld'
export type EthSubnameSpecifier = 'eth-subname'
export type Other2ldNameSpecifier = 'other-2ld'
export type OtherSubnameSpecifier = 'other-subname'
export type RootNameSpecifier = 'root'
export type EthTldNameSpecifier = 'eth-tld'

export type NameType =
  | TldNameSpecifier
  | Eth2ldNameSpecifier
  | EthSubnameSpecifier
  | Other2ldNameSpecifier
  | OtherSubnameSpecifier
  | RootNameSpecifier
  | EthTldNameSpecifier

type GetEthNameType<TString extends EthAnyName> = TString extends EthTldName
  ? EthTldNameSpecifier
  : TString extends EthSubname
  ? EthSubnameSpecifier
  : Eth2ldNameSpecifier
type GetOtherNameType<TString extends TldName> = TString extends OtherSubname
  ? OtherSubnameSpecifier
  : TString extends Other2ldName
  ? Other2ldNameSpecifier
  : TldNameSpecifier

export type GetNameType<TString extends string> = TString extends RootName
  ? RootNameSpecifier
  : TString extends EthAnyName
  ? GetEthNameType<TString>
  : GetOtherNameType<TString>
