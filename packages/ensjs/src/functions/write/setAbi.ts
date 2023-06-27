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
  /** Name to set ABI for */
  name: string
  /** Encoded ABI data to set */
  encodedAbi: EncodedAbi | null
  /** Resolver address to set ABI on */
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

export const makeFunctionData = <
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

/**
 * Sets the ABI for a name on a resolver.
 * @param wallet - {@link WalletWithEns}
 * @param parameters - {@link SetAbiParameters}
 * @returns Transaction hash. {@link SetAbiReturnType}
 *
 * @example
 * import abi from './abi.json'
 * import { createPublicClient, createWalletClient, http, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addContracts, encodeAbi, setAbi } from '@ensdomains/ensjs'
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
 *
 * const encodedAbi = await encodeAbi({ encodeAs: 'json', abi })
 * const hash = await setAbi(wallet, {
 *   name: 'ens.eth',
 *   encodedAbi,
 *   resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
 * })
 * // 0x...
 */
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
