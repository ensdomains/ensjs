import {
  toHex,
  type Account,
  type Address,
  type Hash,
  type SendTransactionParameters,
  type Transport,
} from 'viem'
import { sendTransaction } from 'viem/actions'
import { packetToBytes } from 'viem/ens'
import type {
  ChainWithEns,
  ClientWithAccount,
  WalletClientWithAccount,
} from '../../contracts/consts.js'
import type {
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types.js'
import type { EncodedAbi } from '../../utils/encoders/encodeAbi.js'
import {
  encodeSetAbi,
  type EncodeSetAbiParameters,
} from '../../utils/encoders/encodeSetAbi.js'
import { namehash } from '../../utils/normalise.js'
import {
  getRevertErrorData,
  handleWildcardWritingRevert,
} from '../../utils/wildcardWriting.js'

export type SetAbiRecordDataParameters = {
  /** Name to set ABI for */
  name: string
  /** Encoded ABI data to set */
  encodedAbi: EncodedAbi
  /** Resolver address to set ABI on */
  resolverAddress: Address
}

export type SetAbiRecordDataReturnType = SimpleTransactionRequest

export type SetAbiRecordParameters<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = Prettify<
  SetAbiRecordDataParameters &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type SetAbiRecordReturnType = Hash

export const makeFunctionData = <
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
>(
  _wallet: ClientWithAccount<Transport, TChain, TAccount>,
  { name, encodedAbi, resolverAddress }: SetAbiRecordDataParameters,
): SetAbiRecordDataReturnType => {
  return {
    to: resolverAddress,
    data: encodeSetAbi({
      namehash: namehash(name),
      ...encodedAbi,
    } as EncodeSetAbiParameters),
  }
}

/**
 * Sets the ABI for a name on a resolver.
 * @param wallet - {@link ClientWithAccount}
 * @param parameters - {@link SetAbiRecordParameters}
 * @returns Transaction hash. {@link SetAbiRecordReturnType}
 *
 * @example
 * import abi from './abi.json'
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { encodeAbi } from '@ensdomains/ensjs/utils'
 * import { setAbiRecord } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 *
 * const encodedAbi = await encodeAbi({ encodeAs: 'json', abi })
 * const hash = await setAbiRecord(wallet, {
 *   name: 'ens.eth',
 *   encodedAbi,
 *   resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
 * })
 * // 0x...
 */
async function setAbiRecord<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: WalletClientWithAccount<Transport, TChain, TAccount>,
  {
    name,
    encodedAbi,
    resolverAddress,
    ...txArgs
  }: SetAbiRecordParameters<TChain, TAccount, TChainOverride>,
): Promise<SetAbiRecordReturnType> {
  const data = makeFunctionData(wallet, {
    name,
    encodedAbi,
    resolverAddress,
  })
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  try {
    return await sendTransaction(wallet, writeArgs)
  } catch (error) {
    const errorData = getRevertErrorData(error)
    if (!errorData) throw error

    const txHash = await handleWildcardWritingRevert(
      wallet,
      errorData,
      toHex(packetToBytes(name)),
      writeArgs.data!,
      (txArgs.account || wallet.account) as Address,
    )
    if (!txHash) throw error
    return txHash
  }
}

setAbiRecord.makeFunctionData = makeFunctionData

export default setAbiRecord
