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
import { EncodedAbi } from '../../utils/encoders/encodeAbi'
import {
  EncodeSetAbiParameters,
  encodeSetAbi,
} from '../../utils/encoders/encodeSetAbi'
import { namehash } from '../../utils/normalise'

export type SetAbiDataParameters = {
  name: string
  encodedAbi: EncodedAbi | null
  resolverAddress: Address
}

export type SetAbiDataReturnType = SimpleTransactionRequest

export type SetAbiParameters<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = Prettify<
  SetAbiDataParameters &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type SetAbiReturnType = Hash

const makeFunctionData = <
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
>(
  _wallet: WalletWithEns<Transport, TChain, TAccount>,
  { name, encodedAbi, resolverAddress }: SetAbiDataParameters,
): SetAbiDataReturnType => {
  const encodedAbi_ = encodedAbi || { contentType: 0, encodedData: null }
  return {
    to: resolverAddress,
    data: encodeSetAbi({
      namehash: namehash(name),
      ...encodedAbi_,
    } as EncodeSetAbiParameters),
  }
}

async function setAbi<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    name,
    encodedAbi,
    resolverAddress,
    ...txArgs
  }: SetAbiParameters<TChain, TAccount, TChainOverride>,
): Promise<SetAbiReturnType> {
  const data = makeFunctionData(wallet, {
    name,
    encodedAbi,
    resolverAddress,
  })
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  return wallet.sendTransaction(writeArgs)
}

setAbi.makeFunctionData = makeFunctionData

export default setAbi
