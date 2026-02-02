import type {
  Account,
  Address,
  Chain,
  Client,
  Hash,
  Transport,
  WriteContractErrorType,
  WriteContractParameters,
} from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { userRegistryRegisterSnippet } from '../../../contracts/userRegistry.js'
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

export type CreateSubnameWriteParametersParameters = {
  /** The parent registry address */
  registryAddress: Address
  /** The label of the subname to create */
  label: string
  /** The owner address of the new subname */
  owner: Address
  /** The subregistry address for the new subname (use address(0) for no subregistry) */
  subregistryAddress: Address
  /** The resolver address for the new subname */
  resolverAddress: Address
  /** The role bitmap to grant to the owner */
  roleBitmap: bigint
  /** The expiration timestamp in seconds (defaults to one year from now) */
  expires?: bigint
}

export type CreateSubnameV2WriteParametersReturnType = ReturnType<
  typeof createSubnameV2WriteParameters
>

export const createSubnameV2WriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  {
    registryAddress,
    label,
    owner,
    subregistryAddress,
    resolverAddress,
    roleBitmap,
    expires,
  }: CreateSubnameWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const expiryTimestamp =
    expires ?? BigInt(Math.floor(Date.now() / 1000)) + 31536000n // 1 year

  return {
    address: registryAddress,
    abi: userRegistryRegisterSnippet,
    functionName: 'register',
    args: [
      label,
      owner,
      subregistryAddress,
      resolverAddress,
      roleBitmap,
      expiryTimestamp,
    ],
    chain: client.chain,
    account: client.account,
  } as const satisfies WriteContractParameters<
    typeof userRegistryRegisterSnippet
  >
}

// ================================
// Action
// ================================

export type CreateSubnameV2Parameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
> = Prettify<
  CreateSubnameWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type CreateSubnameV2ReturnType = Hash

export type CreateSubnameV2ErrorType =
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Creates a subname in a UserRegistry using the register function (V2).
 * @param client - {@link Client}
 * @param parameters - {@link CreateSubnameV2Parameters}
 * @returns Transaction hash. {@link CreateSubnameV2ReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { createSubnameV2 } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await createSubnameV2(wallet, {
 *   registryAddress: '0x...', // parent registry
 *   label: 'mysubname',
 *   owner: '0x...',
 *   subregistryAddress: '0x0000000000000000000000000000000000000000',
 *   resolverAddress: '0x...',
 *   roleBitmap: 0n, // or encoded role bitmap
 *   // expires: optional, defaults to one year from now
 * })
 * // 0x...
 */
export async function createSubnameV2<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    registryAddress,
    label,
    owner,
    subregistryAddress,
    resolverAddress,
    roleBitmap,
    expires,
    ...txArgs
  }: CreateSubnameV2Parameters<chain, account, chainOverride>,
): Promise<CreateSubnameV2ReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = createSubnameV2WriteParameters(
    clientWithOverrides(client, txArgs),
    {
      registryAddress,
      label,
      owner,
      subregistryAddress,
      resolverAddress,
      roleBitmap,
      expires,
    },
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
