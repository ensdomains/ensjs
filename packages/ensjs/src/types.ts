import type {
  Abi,
  Account,
  Chain,
  Client,
  TransactionRequest,
  WriteContractParameters,
} from 'viem'

export type Prettify<type> = {
  [key in keyof type]: type[key]
} & {}

type AssignI<type, union> = {
  [key in keyof type as key extends keyof union
    ? union[key] extends void
      ? never
      : key
    : key]: key extends keyof union ? union[key] : type[key]
}

export type Assign<type, union> = AssignI<type, union> & union

export type SimpleTransactionRequest = {
  [P in keyof Pick<TransactionRequest, 'to' | 'data'>]-?: Exclude<
    TransactionRequest[P],
    null
  >
}

export type Extended = { [K in keyof Client]?: undefined } & {
  [key: string]: unknown
}

type AllowedWriteParameters =
  | 'gas'
  | 'gasPrice'
  | 'maxFeePerGas'
  | 'maxPriorityFeePerGas'
  | 'nonce'
  | 'account'
  | 'chain'

export type BasicWriteContractParameters<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
> = WriteContractParameters<
  Abi,
  string,
  readonly unknown[],
  chain,
  account,
  chainOverride
>
export type WriteTransactionParameters<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
> = Pick<
  BasicWriteContractParameters<chain, account, chainOverride>,
  AllowedWriteParameters
>

export type DecodedAbi = {
  contentType: 1 | 2 | 4 | 8 | number
  decoded: boolean
  abi: string | object
}

export type DecodedAddr = {
  coinType: number
  symbol: string
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

type GetEthNameType<name extends EthAnyName> = name extends EthTldName
  ? EthTldNameSpecifier
  : name extends EthSubname
  ? EthSubnameSpecifier
  : Eth2ldNameSpecifier
type GetOtherNameType<name extends TldName> = name extends OtherSubname
  ? OtherSubnameSpecifier
  : name extends Other2ldName
  ? Other2ldNameSpecifier
  : TldNameSpecifier

export type GetNameType<name extends string> = name extends RootName
  ? RootNameSpecifier
  : name extends EthAnyName
  ? GetEthNameType<name>
  : GetOtherNameType<name>
