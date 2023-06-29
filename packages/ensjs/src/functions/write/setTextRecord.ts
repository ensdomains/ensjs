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
  /** The name to set a text record for */
  name: string
  /** The text record key to set */
  key: string
  /** The text record value to set */
  value: string | null
  /** The resolver address to use */
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

/**
 * Sets a text record for a name on a resolver.
 * @param wallet - {@link WalletWithEns}
 * @param parameters - {@link SetTextRecordParameters}
 * @returns Transaction hash. {@link SetTextRecordReturnType}
 *
 * @example
 * import { createPublicClient, createWalletClient, http, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addContracts, setTextRecord } from '@ensdomains/ensjs'
 *
 * const [mainnetWithEns] = addContracts([mainnet])
 * const client = createPublicClient({
 *   chain: mainnetWithEns,
 *   transport: http(),
 * })
 * const wallet = createWalletClient({
 *   chain: mainnetWithEns,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await setTextRecord(wallet, {
 *   name: 'ens.eth',
 *   key: 'foo',
 *   value: 'bar',
 *   resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
 * })
 * // 0x...
 */
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
