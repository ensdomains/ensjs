import {
  Account,
  Hash,
  SendTransactionParameters,
  Transport,
  encodeFunctionData,
} from 'viem'
import { ChainWithEns, WalletWithEns } from '../../contracts/addContracts'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { setFusesSnippet } from '../../contracts/nameWrapper'
import {
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types'
import { CombinedFuseInput, encodeFuses } from '../../utils/fuses'
import { namehash } from '../../utils/normalise'

export type SetFusesDataParameters = {
  /** Name to set fuses for */
  name: string
  /** Fuse object to set to */
  fuses: Prettify<CombinedFuseInput['child']>
}

export type SetFusesDataReturnType = SimpleTransactionRequest

export type SetFusesParameters<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = Prettify<
  SetFusesDataParameters &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type SetFusesReturnType = Hash

export const makeFunctionData = <
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  { name, fuses }: SetFusesDataParameters,
): SetFusesDataReturnType => {
  const encodedFuses = encodeFuses(fuses, 'child')
  return {
    to: getChainContractAddress({ client: wallet, contract: 'ensNameWrapper' }),
    data: encodeFunctionData({
      abi: setFusesSnippet,
      functionName: 'setFuses',
      args: [namehash(name), encodedFuses],
    }),
  }
}

/**
 * Sets the fuses for a name.
 * @param wallet - {@link WalletWithEns}
 * @param parameters - {@link SetFusesParameters}
 * @returns Transaction hash. {@link SetFusesReturnType}
 *
 * @example
 * import { createPublicClient, createWalletClient, http, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addContracts, setFuses } from '@ensdomains/ensjs'
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
 * const hash = await setFuses(wallet, {
 *   name: 'sub.ens.eth',
 *   fuses: {
 *     named: ['CANNOT_TRANSFER'],
 *   },
 * })
 * // 0x...
 */
async function setFuses<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    name,
    fuses,
    ...txArgs
  }: SetFusesParameters<TChain, TAccount, TChainOverride>,
): Promise<SetFusesReturnType> {
  const data = makeFunctionData(wallet, { name, fuses })
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  return wallet.sendTransaction(writeArgs)
}

setFuses.makeFunctionData = makeFunctionData

export default setFuses
