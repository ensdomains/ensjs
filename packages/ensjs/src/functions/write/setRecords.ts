import {
  Account,
  Address,
  Hash,
  SendTransactionParameters,
  Transport,
  encodeFunctionData,
} from 'viem'
import { ChainWithEns, WalletWithEns } from '../../contracts/addContracts'
import { multicallSnippet } from '../../contracts/publicResolver'
import { NoRecordsSpecifiedError } from '../../errors/read'
import {
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types'
import {
  RecordOptions,
  generateRecordCallArray,
} from '../../utils/generateRecordCallArray'
import { namehash } from '../../utils/normalise'

export type SetRecordsDataParameters = {
  name: string
  resolverAddress: Address
} & RecordOptions

export type SetRecordsDataReturnType = SimpleTransactionRequest

export type SetRecordsParameters<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = Prettify<
  SetRecordsDataParameters &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type SetRecordsReturnType = Hash

export const makeFunctionData = <
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
>(
  _wallet: WalletWithEns<Transport, TChain, TAccount>,
  { name, resolverAddress, ...records }: SetRecordsDataParameters,
): SetRecordsDataReturnType => {
  const callArray = generateRecordCallArray({
    namehash: namehash(name),
    ...records,
  })
  if (callArray.length === 0) throw new NoRecordsSpecifiedError()
  if (callArray.length === 1)
    return {
      to: resolverAddress,
      data: callArray[0],
    }
  return {
    to: resolverAddress,
    data: encodeFunctionData({
      abi: multicallSnippet,
      functionName: 'multicall',
      args: [callArray],
    }),
  }
}

async function setRecords<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    name,
    resolverAddress,
    clearRecords,
    contentHash,
    texts,
    coins,
    abi,
    ...txArgs
  }: SetRecordsParameters<TChain, TAccount, TChainOverride>,
): Promise<SetRecordsReturnType> {
  const data = makeFunctionData(wallet, {
    name,
    resolverAddress,
    clearRecords,
    contentHash,
    texts,
    coins,
    abi,
  })
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  return wallet.sendTransaction(writeArgs)
}

setRecords.makeFunctionData = makeFunctionData

export default setRecords
