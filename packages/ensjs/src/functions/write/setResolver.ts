import {
  Account,
  Address,
  Hash,
  SendTransactionParameters,
  Transport,
  encodeFunctionData,
} from 'viem'
import { ChainWithEns, WalletWithEns } from '../../contracts/consts'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { setResolverSnippet } from '../../contracts/registry'
import {
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types'
import { namehash } from '../../utils/normalise'

export type SetResolverDataParameters = {
  /** Name to set resolver for */
  name: string
  /** Contract to set resolver on */
  contract: 'registry' | 'nameWrapper'
  /** Resolver address to set */
  resolverAddress: Address
}

export type SetResolverDataReturnType = SimpleTransactionRequest

export type SetResolverParameters<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = Prettify<
  SetResolverDataParameters &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type SetResolverReturnType = Hash

export const makeFunctionData = <
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  { name, contract, resolverAddress }: SetResolverDataParameters,
): SetResolverDataReturnType => {
  if (contract !== 'registry' && contract !== 'nameWrapper')
    throw new Error(`Unknown contract: ${contract}`)

  return {
    to: getChainContractAddress({
      client: wallet,
      contract: contract === 'nameWrapper' ? 'ensNameWrapper' : 'ensRegistry',
    }),
    data: encodeFunctionData({
      abi: setResolverSnippet,
      functionName: 'setResolver',
      args: [namehash(name), resolverAddress],
    }),
  }
}

/**
 * Sets a resolver for a name.
 * @param wallet - {@link WalletWithEns}
 * @param parameters - {@link SetResolverParameters}
 * @returns Transaction hash. {@link SetResolverReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts, setResolver } from '@ensdomains/ensjs'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await setResolver(wallet, {
 *   name: 'ens.eth',
 *   contract: 'registry',
 *   resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
 * })
 * // 0x...
 */
async function setResolver<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    name,
    contract,
    resolverAddress,
    ...txArgs
  }: SetResolverParameters<TChain, TAccount, TChainOverride>,
): Promise<SetResolverReturnType> {
  const data = makeFunctionData(wallet, { name, contract, resolverAddress })
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  return wallet.sendTransaction(writeArgs)
}

setResolver.makeFunctionData = makeFunctionData

export default setResolver
