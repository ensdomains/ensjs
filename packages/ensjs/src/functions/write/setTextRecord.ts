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

export type SetTextRecordDataParameters = {
  name: string
  key: string
  value: string | null
  resolverAddress: Address
}

export type SetTextRecordDataReturnType = SimpleTransactionRequest

export type SetTextRecordParameters<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = Prettify<
  SetTextRecordDataParameters &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type SetTextRecordReturnType = Hash

export const makeFunctionData = <
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
>(
  _wallet: WalletWithEns<Transport, TChain, TAccount>,
  { name, key, value, resolverAddress }: SetTextRecordDataParameters,
): SetTextRecordDataReturnType => {
  return {
    to: resolverAddress,
    data: encodeSetText({ namehash: namehash(name), key, value }),
  }
}

async function setTextRecord<
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
  }: SetTextRecordParameters<TChain, TAccount, TChainOverride>,
): Promise<SetTextRecordReturnType> {
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

setTextRecord.makeFunctionData = makeFunctionData

export default setTextRecord
