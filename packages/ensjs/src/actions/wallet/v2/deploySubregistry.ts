import type {
  Account,
  Address,
  Chain,
  EncodeFunctionDataErrorType,
  Hash,
  WriteContractErrorType,
  WriteContractParameters,
} from 'viem'
import { encodeFunctionData, keccak256, stringToBytes } from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import type { RequireClientContracts } from '../../../clients/chain.js'
import {
  subregistryInitializeSnippet,
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
// Constants
// ================================

const DEFAULT_ROLE_BITMAP = BigInt(
  '0x1111111111111111111111111111111111111111111111111111111111111111',
)
const DEFAULT_SALT = BigInt(keccak256(stringToBytes(new Date().toISOString())))

// ================================
// Write parameters
// ================================

export type DeploySubregistryWriteParametersParameters = {
  /** The factory contract address */
  factoryAddress: Address
  /** The subregistry implementation contract address */
  implAddress: Address
  /** The admin address for the subregistry (defaults to client.account.address) */
  adminAddress?: Address
  /** The role bitmap for the admin (defaults to full permissions) */
  roleBitmap?: bigint
  /**
   * The salt for proxy deployment.
   * If omitted, a timestamp-based salt is generated via
   * `keccak256(stringToBytes(new Date().toISOString()))`.
   */
  salt?: bigint
}

export type DeploySubregistryWriteParametersReturnType = ReturnType<
  typeof deploySubregistryWriteParameters
>

export type DeploySubregistryWriteParametersErrorType =
  EncodeFunctionDataErrorType

export const deploySubregistryWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: RequireClientContracts<chain, never, account>,
  {
    factoryAddress,
    implAddress,
    adminAddress,
    roleBitmap = DEFAULT_ROLE_BITMAP,
    salt = DEFAULT_SALT,
  }: DeploySubregistryWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const finalAdminAddress = adminAddress ?? client.account.address

  const callData = encodeFunctionData({
    abi: subregistryInitializeSnippet,
    functionName: 'initialize',
    args: [finalAdminAddress, roleBitmap],
  })

  return {
    address: factoryAddress,
    abi: verifiableFactoryDeployProxySnippet,
    functionName: 'deployProxy',
    args: [implAddress, salt, callData],
    chain: client.chain,
    account: client.account,
  } as const satisfies WriteContractParameters<
    typeof verifiableFactoryDeployProxySnippet
  >
}

// ================================
// Action
// ================================

export type DeploySubregistryParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
> = Prettify<
  DeploySubregistryWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type DeploySubregistryReturnType = Hash

export type DeploySubregistryErrorType =
  | DeploySubregistryWriteParametersErrorType
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Deploys a subregistry contract via a verifiable proxy factory.
 * @param client - {@link Client}
 * @param options - {@link DeploySubregistryParameters}
 * @returns Transaction hash. {@link DeploySubregistryReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { deploySubregistry } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await deploySubregistry(wallet, {
 *   factoryAddress: '0x24e32c34effb021cc360b6a4e1de2850dcc59956',
 *   implAddress: '0xc3ae19b222d527d3cdda617953ab878a35527e54',
 * })
 * // 0x...
 */
export async function deploySubregistry<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
>(
  client: RequireClientContracts<chain, never, account>,
  {
    factoryAddress,
    implAddress,
    adminAddress,
    roleBitmap,
    salt,
    ...txArgs
  }: DeploySubregistryParameters<chain, account, chainOverride>,
): Promise<DeploySubregistryReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = deploySubregistryWriteParameters(
    clientWithOverrides(client, txArgs),
    {
      factoryAddress,
      implAddress,
      adminAddress,
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
