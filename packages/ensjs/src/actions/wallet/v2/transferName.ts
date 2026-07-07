import { permissionedRegistrySafeTransferFromSnippet } from '@ensdomains/ensjs-abi/v2/permissionedRegistry'
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

export type TransferNameWriteParametersParameters = {
  /** The registry the name's token lives in (the leaf subregistry) */
  registryAddress: Address
  /**
   * The ERC-1155 token id being transferred — the *versioned* id from
   * `getTokenId`, not the canonical labelhash. The transfer must reference the
   * exact token the owner currently holds, so callers read it first rather than
   * deriving it here.
   */
  tokenId: bigint
  /** Transfer recipient */
  newOwnerAddress: Address
}

export type TransferNameWriteParametersReturnType = ReturnType<
  typeof transferNameWriteParameters
>

export const transferNameWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  {
    registryAddress,
    tokenId,
    newOwnerAddress,
  }: TransferNameWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  return {
    address: registryAddress,
    abi: permissionedRegistrySafeTransferFromSnippet,
    functionName: 'safeTransferFrom',
    args: [client.account.address, newOwnerAddress, tokenId, 1n, '0x'],
    chain: client.chain,
    account: client.account,
  } as const satisfies WriteContractParameters<
    typeof permissionedRegistrySafeTransferFromSnippet
  >
}

// ================================
// Action
// ================================

export type TransferNameParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
> = Prettify<
  TransferNameWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type TransferNameReturnType = Hash

export type TransferNameErrorType =
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Transfers ownership of a v2 name to a new owner.
 *
 * In ENS v2 a name is an ERC-1155 token held in its leaf `PermissionedRegistry`,
 * so ownership moves via the standard ERC-1155 `safeTransferFrom`. There is no
 * dedicated transfer entrypoint.
 *
 * @param client - {@link Client}
 * @param parameters - {@link TransferNameParameters}
 * @returns Transaction hash. {@link TransferNameReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getTokenId } from '@ensdomains/ensjs/public/v2'
 * import { transferName } from '@ensdomains/ensjs/wallet/v2'
 *
 * const wallet = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const registryAddress = '0x...' // leaf registry the token lives in
 * const tokenId = await getTokenId(wallet, { label: 'myname', registryAddress })
 * const hash = await transferName(wallet, {
 *   registryAddress,
 *   tokenId,
 *   newOwnerAddress: '0x...',
 * })
 * // 0x...
 */
export async function transferName<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    registryAddress,
    tokenId,
    newOwnerAddress,
    ...txArgs
  }: TransferNameParameters<chain, account, chainOverride>,
): Promise<TransferNameReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = transferNameWriteParameters(
    clientWithOverrides(client, txArgs),
    {
      registryAddress,
      tokenId,
      newOwnerAddress,
    },
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
