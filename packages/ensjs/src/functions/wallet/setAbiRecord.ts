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
import { namehash } from '../../utils/normalise.js'

export type SetAbiRecordDataParameters = (
  | {
      /** Name to set ABI for */
      name: string
      /** Resolver address to set ABI on */
      resolverAddress: Address
      dedicatedResolverAddress?: undefined
    }
  | {
      /** DedicatedResolver address to set ABI on */
      dedicatedResolverAddress: Address
      name?: undefined
      resolverAddress?: undefined
    }
) & {
  /** Encoded ABI data to set */
  encodedAbi: EncodedAbi
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
  parameters: SetAbiRecordDataParameters,
): SetAbiRecordDataReturnType => {
  const { encodedAbi } = parameters
  
  if (parameters.dedicatedResolverAddress) {
    // Dedicated resolver mode
    return {
      to: parameters.dedicatedResolverAddress,
      data: encodeSetAbi(encodedAbi as EncodeSetAbiParameters),
    }
  } else {
    // Legacy resolver mode
    return {
      to: parameters.resolverAddress,
      data: encodeSetAbi({
        namehash: namehash(parameters.name),
        ...encodedAbi,
      } as EncodeSetAbiParameters),
    }
  }
}

/**
 * Sets the ABI for a name on a resolver.
 * Supports both legacy resolvers (with name parameter) and dedicated resolvers (without name parameter).
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
 * 
 * // Legacy resolver mode
 * const hash1 = await setAbiRecord(wallet, {
 *   name: 'ens.eth',
 *   encodedAbi,
 *   resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
 * })
 * 
 * // Dedicated resolver mode
 * const hash2 = await setAbiRecord(wallet, {
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
  parameters: SetAbiRecordParameters<TChain, TAccount, TChainOverride>,
): Promise<SetAbiRecordReturnType> {
  if (parameters.dedicatedResolverAddress) {
    // Dedicated resolver mode
    const { encodedAbi, dedicatedResolverAddress, ...txArgs } = parameters
    const data = makeFunctionData(wallet, {
      encodedAbi,
      dedicatedResolverAddress,
    })
    const writeArgs = {
      ...data,
      ...txArgs,
    } as SendTransactionParameters<TChain, TAccount, TChainOverride>
    return sendTransaction(wallet, writeArgs)
  } else {
    // Legacy resolver mode
    const { encodedAbi, name, resolverAddress, ...txArgs } = parameters
    const data = makeFunctionData(wallet, {
      encodedAbi,
      name,
      resolverAddress,
    })
    const writeArgs = {
      ...data,
      ...txArgs,
    } as SendTransactionParameters<TChain, TAccount, TChainOverride>
    return sendTransaction(wallet, writeArgs)
  }
}

setAbiRecord.makeFunctionData = makeFunctionData

export default setAbiRecord
