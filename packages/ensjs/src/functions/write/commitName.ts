import {
  Account,
  Hash,
  SendTransactionParameters,
  Transport,
  encodeFunctionData,
} from 'viem'
import { ChainWithEns, WalletWithEns } from '../../contracts/addContracts'
import { commitSnippet } from '../../contracts/ethRegistrarController'
import { getChainContractAddress } from '../../contracts/getChainContractAddress'
import { UnsupportedNameTypeError } from '../../errors/general'
import {
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types'
import { getNameType } from '../../utils/getNameType'
import {
  RegistrationParameters,
  makeCommitment,
} from '../../utils/registerHelpers'
import { wrappedLabelLengthCheck } from '../../utils/wrapper'

export type CommitNameDataParameters = RegistrationParameters

export type CommitNameDataReturnType = SimpleTransactionRequest

export type CommitNameParameters<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined,
> = Prettify<
  CommitNameDataParameters &
    WriteTransactionParameters<TChain, TAccount, TChainOverride>
>

export type CommitNameReturnType = Hash

export const makeFunctionData = <
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  args: CommitNameDataParameters,
): CommitNameDataReturnType => {
  const labels = args.name.split('.')
  const nameType = getNameType(args.name)
  if (nameType !== 'eth-2ld')
    throw new UnsupportedNameTypeError({
      nameType,
      supportedNameTypes: ['eth-2ld'],
      details: 'Only 2ld-eth name registration is supported',
    })
  wrappedLabelLengthCheck(labels[0])
  return {
    to: getChainContractAddress({
      client: wallet,
      contract: 'ensEthRegistrarController',
    }),
    data: encodeFunctionData({
      abi: commitSnippet,
      functionName: 'commit',
      args: [makeCommitment(args)],
    }),
  }
}

/**
 * Commits a name to be registered
 * @param wallet - {@link WalletWithEns}
 * @param parameters - {@link CommitNameParameters}
 * @returns Transaction hash. {@link CommitNameReturnType}
 *
 * @example
 * import { createPublicClient, createWalletClient, http, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addContracts, commitName, randomSecret } from '@ensdomains/ensjs'
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
 * const secret = randomSecret()
 * const hash = await commitName(wallet, {
 *   name: 'example.eth',
 *   owner: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
 *   duration: 31536000, // 1 year
 *   secret,
 * })
 * // 0x...
 */
async function commitName<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: WalletWithEns<Transport, TChain, TAccount>,
  {
    name,
    owner,
    duration,
    secret,
    resolverAddress,
    records,
    reverseRecord,
    fuses,
    ...txArgs
  }: CommitNameParameters<TChain, TAccount, TChainOverride>,
): Promise<CommitNameReturnType> {
  const data = makeFunctionData(wallet, {
    name,
    owner,
    duration,
    secret,
    resolverAddress,
    records,
    reverseRecord,
    fuses,
  })
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  return wallet.sendTransaction(writeArgs)
}

commitName.makeFunctionData = makeFunctionData

export default commitName
