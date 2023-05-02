import {
  Account,
  Address,
  Hash,
  SendTransactionParameters,
  Transport,
} from 'viem'
import { ChainWithEns, WalletWithEns } from '../../contracts/addContracts'
import {
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types'
import { encodeSetText } from '../../utils/encoders/encodeSetText'
import { namehash } from '../../utils/normalise'

export type SetTextDataParameters = {
  name: string
  key: string
  value: string | null
  resolverAddress: Address
}

export type SetTextDataReturnType = SimpleTransactionRequest

export type SetTextParameters<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = Prettify<
  SetTextDataParameters &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type SetTextReturnType = Hash

const makeFunctionData = <
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
>(
  _wallet: WalletWithEns<Transport, TChain, TAccount>,
  { name, key, value, resolverAddress }: SetTextDataParameters,
): SetTextDataReturnType => {
  return {
    to: resolverAddress,
    data: encodeSetText({ namehash: namehash(name), key, value }),
  }
}

async function setText<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    name,
    key,
    value,
    resolverAddress,
    ...txArgs
  }: SetTextParameters<TChain, TAccount, TChainOverride>,
): Promise<SetTextReturnType> {
  const data = makeFunctionData(wallet, {
    name,
    key,
    value,
    resolverAddress,
  })
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  return wallet.sendTransaction(writeArgs)
}

setText.makeFunctionData = makeFunctionData

export default setText
