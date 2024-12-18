import {
  encodeFunctionData,
  type Account,
  type Hash,
  type SendTransactionParameters,
  type Transport,
} from 'viem'
import { sendTransaction } from 'viem/actions'
import type { ChainWithEns, ClientWithAccount } from '../../contracts/consts.js'
import { legacyEthRegistrarControllerCommitSnippet } from '../../contracts/legacyEthRegistrarController.js'
import { getChainContractAddress } from '../../contracts/getChainContractAddress.js'
import { UnsupportedNameTypeError } from '../../errors/general.js'
import type {
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types.js'
import { getNameType } from '../../utils/getNameType.js'
import {
  makeLegacyCommitment,
  type LegacyRegistrationParameters,
} from '../../utils/legacyRegisterHelpers.js'
import { EMPTY_ADDRESS } from '../../utils/consts.js'

export type CommitNameDataParameters = LegacyRegistrationParameters

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
  wallet: ClientWithAccount<Transport, TChain, TAccount>,
  args: CommitNameDataParameters,
): CommitNameDataReturnType => {
  const nameType = getNameType(args.name)
  if (nameType !== 'eth-2ld')
    throw new UnsupportedNameTypeError({
      nameType,
      supportedNameTypes: ['eth-2ld'],
      details: 'Only 2ld-eth name registration is supported',
    })

  return {
    to: getChainContractAddress({
      client: wallet,
      contract: 'legacyEthRegistrarController',
    }),
    data: encodeFunctionData({
      abi: legacyEthRegistrarControllerCommitSnippet,
      functionName: 'commit',
      args: [makeLegacyCommitment(args)],
    }),
  }
}

/**
 * Commits a name to be registered
 * @param wallet - {@link ClientWithAccount}
 * @param parameters - {@link CommitNameParameters}
 * @returns Transaction hash. {@link CommitNameReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { commitName } from '@ensdomains/ensjs/wallet'
 * import { randomSecret } from '@ensdomains/ensjs/utils'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
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
async function legacyCommitName<
  TChain extends ChainWithEns,
  TAccount extends Account | undefined,
  TChainOverride extends ChainWithEns | undefined = ChainWithEns,
>(
  wallet: ClientWithAccount<Transport, TChain, TAccount>,
  {
    name,
    owner,
    duration,
    secret,
    resolverAddress = EMPTY_ADDRESS,
    address = EMPTY_ADDRESS,
    ...txArgs
  }: CommitNameParameters<TChain, TAccount, TChainOverride>,
): Promise<CommitNameReturnType> {
  const data = makeFunctionData(wallet, {
    name,
    owner,
    duration,
    secret,
    resolverAddress,
    address,
  })
  const writeArgs = {
    ...data,
    ...txArgs,
  } as SendTransactionParameters<TChain, TAccount, TChainOverride>
  return sendTransaction(wallet, writeArgs)
}

legacyCommitName.makeFunctionData = makeFunctionData

export default legacyCommitName
