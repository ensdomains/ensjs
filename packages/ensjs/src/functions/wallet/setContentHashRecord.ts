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
import { encodeSetContentHash } from '../../utils/encoders/encodeSetContentHash.js'
import { namehash } from '../../utils/normalise.js'
import {
  getRevertErrorData,
  handleWildcardWritingRevert,
} from '../../utils/wildcardWriting.js'

export type SetContentHashRecordDataParameters = {
  /** Name to set content hash for */
  name: string
  /** Content hash value */
  contentHash: string | null
  /** Resolver address to set content hash on */
  resolverAddress: Address
}

export type SetContentHashRecordDataReturnType = SimpleTransactionRequest

export type SetContentHashRecordParameters<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = Prettify<
  SetContentHashRecordDataParameters &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type SetContentHashRecordReturnType = Hash

export const makeFunctionData = <
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
>(
  _wallet: ClientWithAccount<Transport, TChain, TAccount>,
  { name, contentHash, resolverAddress }: SetContentHashRecordDataParameters,
): SetContentHashRecordDataReturnType => {
  return {
    to: resolverAddress,
    data: encodeSetContentHash({ namehash: namehash(name), contentHash }),
  }
}

/**
 * Sets the content hash record for a name on a resolver.
 * @param wallet - {@link ClientWithAccount}
 * @param parameters - {@link SetContentHashRecordParameters}
 * @returns Transaction hash. {@link SetContentHashRecordReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { setContentHashRecord } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await setContentHashRecord(wallet, {
 *   name: 'ens.eth',
 *   value: 'ipns://k51qzi5uqu5djdczd6zw0grmo23j2vkj9uzvujencg15s5rlkq0ss4ivll8wqw',
 *   resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
 * })
 * // 0x...
 */
async function setContentHashRecord<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: WalletClientWithAccount<Transport, TChain, TAccount>,
  {
    name,
    contentHash,
    resolverAddress,
    ...txArgs
  }: SetContentHashRecordParameters<TChain, TAccount, TChainOverride>,
): Promise<SetContentHashRecordReturnType> {
  const data = makeFunctionData(wallet, {
    name,
    contentHash,
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

setContentHashRecord.makeFunctionData = makeFunctionData

export default setContentHashRecord
