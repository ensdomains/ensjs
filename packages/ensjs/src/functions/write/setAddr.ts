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
  /** Name to set address record for */
  name: string
  /** Coin ticker or ID to set */
  coin: string | number
  /** Value to set, null if deleting */
  value: Address | string | null
  /** Resolver address to set address record on */
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

export const makeFunctionData = <
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
>(
  _wallet: WalletWithEns<Transport, TChain, TAccount>,
  { name, coin, value, resolverAddress }: SetAddrDataParameters,
): SetAddrDataReturnType => {
  return {
    to: resolverAddress,
    data: encodeSetAddr({ namehash: namehash(name), coin, value }),
  }
}

/**
 * Sets an address record for a name on a resolver.
 * @param wallet - {@link WalletWithEns}
 * @param parameters - {@link SetAddrParameters}
 * @returns Transaction hash. {@link SetAddrReturnType}
 *
 * @example
 * import { createPublicClient, createWalletClient, http, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addContracts, setAddr } from '@ensdomains/ensjs'
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
 * const hash = await setAddr(wallet, {
 *   name: 'ens.eth',
 *   coin: 'ETH',
 *   value: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
 *   resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
 * })
 * // 0x...
 */
async function setAddr<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    name,
    coin,
    value,
    resolverAddress,
    ...txArgs
  }: SetAddrParameters<TChain, TAccount, TChainOverride>,
): Promise<SetAddrReturnType> {
  const data = makeFunctionData(wallet, {
    name,
    coin,
    value,
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
