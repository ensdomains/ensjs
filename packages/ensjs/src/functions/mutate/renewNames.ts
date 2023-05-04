import {
  Account,
  Hash,
  SendTransactionParameters,
  Transport,
  encodeFunctionData,
} from 'viem'
import { ChainWithEns, WalletWithEns } from '../../contracts/addContracts'
import { renewAllSnippet } from '../../contracts/bulkRenewal'
import { renewSnippet } from '../../contracts/ethRegistrarController'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import {
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types'

export type RenewNamesDataParameters = {
  nameOrNames: string | string[]
  duration: bigint | number
  value: bigint
}

export type RenewNamesDataReturnType = SimpleTransactionRequest & {
  value: bigint
}

export type RenewNamesParameters<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = Prettify<
  RenewNamesDataParameters &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type RenewNamesReturnType = Hash

export const makeFunctionData = <
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  { nameOrNames, duration, value }: RenewNamesDataParameters,
): RenewNamesDataReturnType => {
  const names = Array.isArray(nameOrNames) ? nameOrNames : [nameOrNames]
  const labels = names.map((name) => {
    const label = name.split('.')
    if (label.length !== 2 || label[1] !== 'eth') {
      throw new Error('Currently only .eth TLD renewals are supported')
    }
    return label[0]
  })

  if (labels.length === 1) {
    return {
      to: getChainContractAddress({
        client: wallet,
        contract: 'ensEthRegistrarController',
      }),
      data: encodeFunctionData({
        abi: renewSnippet,
        functionName: 'renew',
        args: [labels[0], BigInt(duration)],
      }),
      value,
    }
  }

  return {
    to: getChainContractAddress({
      client: wallet,
      contract: 'ensBulkRenewal',
    }),
    data: encodeFunctionData({
      abi: renewAllSnippet,
      functionName: 'renewAll',
      args: [labels, BigInt(duration)],
    }),
    value,
  }
}

async function renewNames<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    nameOrNames,
    duration,
    value,
    ...txArgs
  }: RenewNamesParameters<TChain, TAccount, TChainOverride>,
): Promise<RenewNamesReturnType> {
  const data = makeFunctionData(wallet, { nameOrNames, duration, value })
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  return wallet.sendTransaction(writeArgs)
}

renewNames.makeFunctionData = makeFunctionData

export default renewNames
