import { permissionedResolverInitializeSnippet } from '@ensdomains/ensjs-abi/v2/permissionedResolver'
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
import { RESOLVER_ALL_ROLES } from '../../../../utils/v2/roles/resolverRoles.js'
import { deployVerifiableProxyWriteParameters } from './deployVerifiableProxy.js'

// ================================
// Write parameters
// ================================

export type ResolverGrant = {
  /** The account to grant roles to on the root resource */
  account: Address
  /** The role bitmap to grant (defaults to every role and admin role) */
  roleBitmap?: bigint
}

export type DeployPermissionedResolverWriteParametersParameters = {
  /** The VerifiableFactory address */
  factoryAddress: Address
  /** The PermissionedResolver implementation address */
  implAddress: Address
  /**
   * Root-resource grants applied at initialization. Defaults to a single grant
   * of every role to `client.account.address`.
   */
  grants?: ResolverGrant[]
  /**
   * Setter calls run at initialization without permission checks, so the
   * resolver can be deployed with its first records in one transaction.
   */
  calls?: Hex[]
  /** The CREATE2 salt; see {@link deployVerifiableProxyWriteParameters} */
  salt?: bigint
}

export type DeployPermissionedResolverWriteParametersReturnType = ReturnType<
  typeof deployPermissionedResolverWriteParameters
>

export type DeployPermissionedResolverWriteParametersErrorType =
  EncodeFunctionDataErrorType

/** `initialize(Grant[] grants, bytes[] calls)` calldata for a PermissionedResolver proxy. */
export const encodePermissionedResolverInitialize = ({
  grants,
  calls = [],
}: {
  grants: ResolverGrant[]
  calls?: Hex[]
}): Hex =>
  encodeFunctionData({
    abi: permissionedResolverInitializeSnippet,
    functionName: 'initialize',
    args: [
      grants.map(({ account, roleBitmap = RESOLVER_ALL_ROLES }) => ({
        account,
        roleBitmap,
      })),
      calls,
    ],
  })

export const deployPermissionedResolverWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  {
    factoryAddress,
    implAddress,
    grants,
    calls,
    salt,
  }: DeployPermissionedResolverWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  return deployVerifiableProxyWriteParameters(client, {
    factoryAddress,
    implAddress,
    callData: encodePermissionedResolverInitialize({
      grants: grants ?? [{ account: client.account.address }],
      calls,
    }),
    ...(salt !== undefined ? { salt } : {}),
  })
}

// ================================
// Action
// ================================

export type DeployPermissionedResolverParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
> = Prettify<
  DeployPermissionedResolverWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type DeployPermissionedResolverReturnType = Hash

export type DeployPermissionedResolverErrorType =
  | DeployPermissionedResolverWriteParametersErrorType
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Deploys a PermissionedResolver proxy (V2) through the VerifiableFactory,
 * initialised with `initialize(Grant[] grants, bytes[] calls)`.
 *
 * @param client - {@link Client}
 * @param parameters - {@link DeployPermissionedResolverParameters}
 * @returns Transaction hash. {@link DeployPermissionedResolverReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { deployPermissionedResolver } from '@ensdomains/ensjs/wallet/v2'
 *
 * const wallet = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await deployPermissionedResolver(wallet, {
 *   factoryAddress: '0x...',
 *   implAddress: '0x...',
 * })
 * // 0x...
 */
export async function deployPermissionedResolver<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    factoryAddress,
    implAddress,
    grants,
    calls,
    salt,
    ...txArgs
  }: DeployPermissionedResolverParameters<chain, account, chainOverride>,
): Promise<DeployPermissionedResolverReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = deployPermissionedResolverWriteParameters(
    clientWithOverrides(client, txArgs),
    { factoryAddress, implAddress, grants, calls, salt },
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
