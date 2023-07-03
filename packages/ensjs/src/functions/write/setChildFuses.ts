import {
  Account,
  Hash,
  SendTransactionParameters,
  Transport,
  encodeFunctionData,
  labelhash,
} from 'viem'
import { ChainWithEns, WalletWithEns } from '../../contracts/consts'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { setChildFusesSnippet } from '../../contracts/nameWrapper'
import {
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types'
import { CombinedFuseInput, encodeFuses } from '../../utils/fuses'
import { namehash } from '../../utils/normalise'

export type SetChildFusesDataParameters = {
  /** Name to set child fuses for */
  name: string
  /** Fuse object or number value to set to */
  fuses: Partial<CombinedFuseInput> | number
  /** Expiry to set for fuses */
  expiry?: number | bigint
}

export type SetChildFusesDataReturnType = SimpleTransactionRequest

export type SetChildFusesParameters<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = Prettify<
  SetChildFusesDataParameters &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type SetChildFusesReturnType = Hash

export const makeFunctionData = <
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  { name, fuses, expiry }: SetChildFusesDataParameters,
): SetChildFusesDataReturnType => {
  const encodedFuses = encodeFuses(fuses)
  const labels = name.split('.')
  const labelHash = labelhash(labels.shift()!)
  const parentNode = namehash(labels.join('.'))
  return {
    to: getChainContractAddress({ client: wallet, contract: 'ensNameWrapper' }),
    data: encodeFunctionData({
      abi: setChildFusesSnippet,
      functionName: 'setChildFuses',
      args: [parentNode, labelHash, encodedFuses, BigInt(expiry ?? 0)],
    }),
  }
}

/**
 * Sets the fuses for a name as the parent.
 * @param wallet - {@link WalletWithEns}
 * @param parameters - {@link SetChildFusesParameters}
 * @returns Transaction hash. {@link SetChildFusesReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts, setChildFuses } from '@ensdomains/ensjs'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await setChildFuses(wallet, {
 *   name: 'sub.ens.eth',
 *   fuses: {
 *     parent: {
 *       named: ['PARENT_CANNOT_CONTROl'],
 *     },
 *   },
 * })
 * // 0x...
 */
async function setChildFuses<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    name,
    fuses,
    expiry,
    ...txArgs
  }: SetChildFusesParameters<TChain, TAccount, TChainOverride>,
): Promise<SetChildFusesReturnType> {
  const data = makeFunctionData(wallet, { name, fuses, expiry })
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  return wallet.sendTransaction(writeArgs)
}

setChildFuses.makeFunctionData = makeFunctionData

export default setChildFuses
