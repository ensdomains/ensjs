import {
  Account,
  Address,
  Hash,
  SendTransactionParameters,
  Transport,
  encodeFunctionData,
} from 'viem'
import { ChainWithEns, WalletWithEns } from '../../contracts/addContracts'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { setResolverSnippet } from '../../contracts/registry'
import {
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types'
import { namehash } from '../../utils/normalise'

export type SetResolverDataParameters = {
  name: string
  contract: 'registry' | 'nameWrapper'
  resolverAddress: Address
}

export type SetResolverDataReturnType = SimpleTransactionRequest

export type SetResolverParameters<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = Prettify<
  SetResolverDataParameters &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type SetResolverReturnType = Hash

export const makeFunctionData = <
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  { name, contract, resolverAddress }: SetResolverDataParameters,
): SetResolverDataReturnType => {
  if (contract !== 'registry' && contract !== 'nameWrapper')
    throw new Error(`Unknown contract: ${contract}`)

  return {
    to: getChainContractAddress({
      client: wallet,
      contract: contract === 'nameWrapper' ? 'ensNameWrapper' : 'ensRegistry',
    }),
    data: encodeFunctionData({
      abi: setResolverSnippet,
      functionName: 'setResolver',
      args: [namehash(name), resolverAddress],
    }),
  }
}

async function setResolver<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    name,
    contract,
    resolverAddress,
    ...txArgs
  }: SetResolverParameters<TChain, TAccount, TChainOverride>,
): Promise<SetResolverReturnType> {
  const data = makeFunctionData(wallet, { name, contract, resolverAddress })
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  return wallet.sendTransaction(writeArgs)
}

setResolver.makeFunctionData = makeFunctionData

export default setResolver
