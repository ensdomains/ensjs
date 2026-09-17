import {
  proxyInitializeSnippet,
  verifiableFactoryDeployProxySnippet,
} from '@ensdomains/ensjs-abi/v2/verifiableFactory'
import type {
  Account,
  Address,
  Chain,
  Client,
  EncodeFunctionDataErrorType,
  Hash,
  Hex,
  Transport,
  WriteContractErrorType,
  WriteContractParameters,
} from 'viem'
import { encodeFunctionData } from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import type {
  Prettify,
  WriteTransactionParameters,
} from '../../../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../../types/internal.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../../../utils/clientWithOverrides.js'
import { randomProxySalt } from '../../../../utils/v2/verifiableFactory/randomProxySalt.js'

// ================================
// Constants
// ================================

const DEFAULT_ROLE_BITMAP = BigInt(
  '0x1111111111111111111111111111111111111111111111111111111111111111',
)

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
   * If omitted, defaults to
   * `initialize([{ account: client.account.address, roleBitmap }])`.
   *
   * A `PermissionedResolver` proxy needs its own initializer (it takes a
   * trailing `bytes[] calls`), so pass explicit `callData` encoded with
   * `permissionedResolverInitializeSnippet` for those.
   */
  callData?: Hex
  /**
   * The role bitmap granted to the proxy admin when generating default
   * calldata. Ignored when `callData` is provided. Defaults to a bitmap
   * containing every role.
   */
  roleBitmap?: bigint
  /**
   * The salt for proxy deployment.
   * If omitted, a random 256-bit salt is drawn on every call, so each call
   * encodes a different deploy. Pass one when the same deploy has to be built
   * more than once (e.g. for a gas estimate and then the send).
   *
   * The factory derives the proxy address from `(msg.sender, salt)`, so an
   * account reusing a salt targets an address it already occupies and the
   * deploy reverts.
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
  client: Client<Transport, chain, account>,
  {
    factoryAddress,
    implAddress,
    callData,
    roleBitmap = DEFAULT_ROLE_BITMAP,
    salt = randomProxySalt(),
  }: DeployVerifiableProxyWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const finalCallData =
    callData ??
    encodeFunctionData({
      abi: proxyInitializeSnippet,
      functionName: 'initialize',
      args: [[{ account: client.account.address, roleBitmap }]],
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
 * import { deployVerifiableProxy } from '@ensdomains/ensjs/wallet/v2'
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
  client: Client<Transport, chain, account>,
  {
    factoryAddress,
    implAddress,
    callData,
    roleBitmap,
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
      roleBitmap,
      salt,
    },
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
