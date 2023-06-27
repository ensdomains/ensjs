import {
  Account,
  Address,
  Hash,
  SendTransactionParameters,
  Transport,
  encodeFunctionData,
} from 'viem'
import { parseAccount } from 'viem/utils'
import { ChainWithEns, WalletWithEns } from '../../contracts/addContracts'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import {
  setNameForAddrSnippet,
  setNameSnippet,
} from '../../contracts/reverseRegistrar'
import {
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types'

type BaseSetPrimaryNameDataParameters = {
  name: string
  address?: Address
  resolverAddress?: Address
}

type SelfSetPrimaryNameDataParameters = {
  address?: never
  resolverAddress?: never
}

type OtherSetPrimaryNameDataParameters = {
  address: Address
  resolverAddress?: Address
}

export type SetPrimaryNameDataParameters = BaseSetPrimaryNameDataParameters &
  (SelfSetPrimaryNameDataParameters | OtherSetPrimaryNameDataParameters)

export type SetPrimaryNameDataReturnType = SimpleTransactionRequest

export type SetPrimaryNameParameters<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = Prettify<
  SetPrimaryNameDataParameters &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type SetPrimaryNameReturnType = Hash

export const makeFunctionData = <
  TChain extends ChainWithEns,
  TAccount extends Account,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    name,
    address,
    resolverAddress = getChainContractAddress({
      client: wallet,
      contract: 'ensPublicResolver',
    }),
  }: SetPrimaryNameDataParameters,
): SetPrimaryNameDataReturnType => {
  const reverseRegistrarAddress = getChainContractAddress({
    client: wallet,
    contract: 'ensReverseRegistrar',
  })
  if (address) {
    return {
      to: reverseRegistrarAddress,
      data: encodeFunctionData({
        abi: setNameForAddrSnippet,
        functionName: 'setNameForAddr',
        args: [
          address,
          wallet.account.address,
          resolverAddress ||
            getChainContractAddress({
              client: wallet,
              contract: 'ensPublicResolver',
            }),
          name,
        ],
      }),
    }
  }

  return {
    to: reverseRegistrarAddress,
    data: encodeFunctionData({
      abi: setNameSnippet,
      functionName: 'setName',
      args: [name],
    }),
  }
}

async function setPrimaryName<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    name,
    address,
    resolverAddress,
    ...txArgs
  }: SetPrimaryNameParameters<TChain, TAccount, TChainOverride>,
): Promise<SetPrimaryNameReturnType> {
  const data = makeFunctionData(
    {
      ...wallet,
      account: parseAccount((txArgs.account || wallet.account)!),
    } as WalletWithEns<Transport, TChain, Account>,
    { name, address, resolverAddress } as SetPrimaryNameDataParameters,
  )
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  return wallet.sendTransaction(writeArgs)
}

setPrimaryName.makeFunctionData = makeFunctionData

export default setPrimaryName
