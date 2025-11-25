import type {
  Account,
  Address,
  Chain,
  EncodeFunctionDataErrorType,
  Hash,
  Hex,
  WriteContractErrorType,
  WriteContractParameters,
} from 'viem'
import { encodeFunctionData, keccak256, stringToBytes } from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import type { RequireClientContracts } from '../../../clients/chain.js'
import {
  proxyInitializeSnippet,
  verifiableFactoryDeployProxySnippet,
} from '../../../contracts/verifiableFactory.js'
import type {
  Prettify,
  WriteTransactionParameters,
} from '../../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../../utils/clientWithOverrides.js'

// ================================
// Write parameters
// ================================

export type DeployVerifiableProxyWriteParametersParameters = {
  /** The factory contract address */
  factoryAddress: Address
  /** The implementation contract address */
  implAddress: Address
  /**
   * The initialization calldata.
   * If omitted, defaults to `initialize(client.account.address)`.
   */
  callData?: Hex
  /**
   * The salt for proxy deployment.
   * If omitted, a timestamp-based salt is generated via
   * `keccak256(stringToBytes(new Date().toISOString()))`.
   */
  salt?: bigint
}

export type DeployVerifiableProxyWriteParametersReturnType = ReturnType<
  typeof deployVerifiableProxyWriteParameters
>

export type DeployVerifiableProxyWriteParametersErrorType =
  EncodeFunctionDataErrorType

export const deployVerifiableProxyWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: RequireClientContracts<chain, never, account>,
  {
    factoryAddress,
    implAddress,
    callData,
    salt = BigInt(keccak256(stringToBytes(new Date().toISOString()))),
  }: DeployVerifiableProxyWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const finalCallData =
    callData ??
    encodeFunctionData({
      abi: proxyInitializeSnippet,
      functionName: 'initialize',
      args: [client.account.address],
    })

  return {
    address: factoryAddress,
    abi: verifiableFactoryDeployProxySnippet,
    functionName: 'deployProxy',
    args: [implAddress, salt, finalCallData],
    chain: client.chain,
    account: client.account,
  } as const satisfies WriteContractParameters<
    typeof verifiableFactoryDeployProxySnippet
  >
}

// ================================
// Action
// ================================

export type DeployVerifiableProxyParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
> = Prettify<
  DeployVerifiableProxyWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type DeployVerifiableProxyReturnType = Hash

export type DeployVerifiableProxyErrorType =
  | DeployVerifiableProxyWriteParametersErrorType
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Deploys a verifiable proxy contract.
 * @param client - {@link Client}
 * @param options - {@link DeployVerifiableProxyParameters}
 * @returns Transaction hash. {@link DeployVerifiableProxyReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { deployVerifiableProxy } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await deployVerifiableProxy(wallet, {
 *   factoryAddress: '0x24e32c34effb021cc360b6a4e1de2850dcc59956',
 *   implAddress: '0xc3ae19b222d527d3cdda617953ab878a35527e54',
 * })
 * // 0x...
 */
export async function deployVerifiableProxy<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
>(
  client: RequireClientContracts<chain, never, account>,
  {
    factoryAddress,
    implAddress,
    callData,
    salt,
    ...txArgs
  }: DeployVerifiableProxyParameters<chain, account, chainOverride>,
): Promise<DeployVerifiableProxyReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = deployVerifiableProxyWriteParameters(
    clientWithOverrides(client, txArgs),
    {
      factoryAddress,
      implAddress,
      callData,
      salt,
    },
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
