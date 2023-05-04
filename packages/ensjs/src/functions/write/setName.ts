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

type BaseSetNameDataParameters = {
  name: string
  address?: Address
  resolverAddress?: Address
}

type SelfSetNameDataParameters = {
  address?: never
  resolverAddress?: never
}

type OtherSetNameDataParameters = {
  address: Address
  resolverAddress?: Address
}

export type SetNameDataParameters = BaseSetNameDataParameters &
  (SelfSetNameDataParameters | OtherSetNameDataParameters)

export type SetNameDataReturnType = SimpleTransactionRequest

export type SetNameParameters<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = Prettify<
  SetNameDataParameters &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type SetNameReturnType = Hash

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
  }: SetNameDataParameters,
): SetNameDataReturnType => {
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

async function setName<
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
  }: SetNameParameters<TChain, TAccount, TChainOverride>,
): Promise<SetNameReturnType> {
  const data = makeFunctionData(
    {
      ...wallet,
      account: parseAccount((txArgs.account || wallet.account)!),
    } as WalletWithEns<Transport, TChain, Account>,
    { name, address, resolverAddress } as SetNameDataParameters,
  )
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  return wallet.sendTransaction(writeArgs)
}

setName.makeFunctionData = makeFunctionData

export default setName
