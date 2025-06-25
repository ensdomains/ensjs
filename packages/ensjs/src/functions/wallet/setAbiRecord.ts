import type {
  Account,
  Address,
  Hash,
  SendTransactionParameters,
  Transport,
} from 'viem'
import { sendTransaction } from 'viem/actions'
import type { ChainWithEns, ClientWithAccount } from '../../contracts/consts.js'
import type {
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types.js'
import type { EncodedAbi } from '../../utils/encoders/encodeAbi.js'
import {
  type EncodeSetAbiParameters,
  encodeSetAbi,
} from '../../utils/encoders/encodeSetAbi.js'

export type SetAbiRecordDataParameters = {
  /** Encoded ABI data to set */
  encodedAbi: EncodedAbi
  /** DedicatedResolver address to set ABI on */
  dedicatedResolverAddress: Address
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
  { encodedAbi, dedicatedResolverAddress }: SetAbiRecordDataParameters,
): SetAbiRecordDataReturnType => {
  return {
    to: dedicatedResolverAddress,
    data: encodeSetAbi(encodedAbi as EncodeSetAbiParameters),
  }
}

/**
 * Sets the ABI for a namechain DedicatedResolver.
 * Unlike the standard resolver, this sets a universal ABI that will be returned
 * for any name that uses this dedicated resolver.
 * 
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
 *   encodedAbi,
 *   dedicatedResolverAddress: '0x1234567890123456789012345678901234567890',
 * })
 * // 0x...
 */
async function setAbiRecord<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: ClientWithAccount<Transport, TChain, TAccount>,
  {
    encodedAbi,
    dedicatedResolverAddress,
    ...txArgs
  }: SetAbiRecordParameters<TChain, TAccount, TChainOverride>,
): Promise<SetAbiRecordReturnType> {
  const data = makeFunctionData(wallet, {
    encodedAbi,
    dedicatedResolverAddress,
  })
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  return sendTransaction(wallet, writeArgs)
}

setAbiRecord.makeFunctionData = makeFunctionData

export default setAbiRecord
