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
import { encodeSetAddr } from '../../utils/encoders/encodeSetAddr'
import { namehash } from '../../utils/normalise'

export type SetAddrDataParameters = {
  name: string
  coin: string | number
  address: Address | string | null
  resolverAddress: Address
}

export type SetAddrDataReturnType = SimpleTransactionRequest

export type SetAddrParameters<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = Prettify<
  SetAddrDataParameters &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type SetAddrReturnType = Hash

const makeFunctionData = <
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
>(
  _wallet: WalletWithEns<Transport, TChain, TAccount>,
  { name, coin, address, resolverAddress }: SetAddrDataParameters,
): SetAddrDataReturnType => {
  return {
    to: resolverAddress,
    data: encodeSetAddr({ namehash: namehash(name), coin, address }),
  }
}

async function setAddr<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    name,
    coin,
    address,
    resolverAddress,
    ...txArgs
  }: SetAddrParameters<TChain, TAccount, TChainOverride>,
): Promise<SetAddrReturnType> {
  const data = makeFunctionData(wallet, {
    name,
    coin,
    address,
    resolverAddress,
  })
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  return wallet.sendTransaction(writeArgs)
}

setAddr.makeFunctionData = makeFunctionData

export default setAddr
