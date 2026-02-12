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
import { labelhash } from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { erc1155BurnSnippet } from '../../../contracts/erc1155.js'
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

export type DeleteSubnameWriteParametersParameters = {
  /** The parent registry address */
  registryAddress: Address
  /** The label of the subname to delete */
  label: string
  /** The owner address of the subname (account to burn from) */
  owner: Address
}

export type DeleteSubnameV2WriteParametersReturnType = ReturnType<
  typeof deleteSubnameV2WriteParameters
>

export const deleteSubnameV2WriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  {
    registryAddress,
    label,
    owner,
  }: DeleteSubnameWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  // The tokenId is the labelhash of the subname label
  const tokenId = BigInt(labelhash(label))

  return {
    address: registryAddress,
    abi: erc1155BurnSnippet,
    functionName: 'burn',
    args: [owner, tokenId, 1n],
    chain: client.chain,
    account: client.account,
  } as const satisfies WriteContractParameters<typeof erc1155BurnSnippet>
}

// ================================
// Action
// ================================

export type DeleteSubnameV2Parameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
> = Prettify<
  DeleteSubnameWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type DeleteSubnameV2ReturnType = Hash

export type DeleteSubnameV2ErrorType =
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Deletes a subname by burning its ERC1155 token in the parent registry (V2).
 *
 * In ENSv2, subnames are ERC1155 tokens managed by their parent registry.
 * To remove a subname, burn its token which clears the subname's data
 * from the RegistryDatastore, including its subregistry and resolver references.
 *
 * @param client - {@link Client}
 * @param parameters - {@link DeleteSubnameV2Parameters}
 * @returns Transaction hash. {@link DeleteSubnameV2ReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { deleteSubnameV2 } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await deleteSubnameV2(wallet, {
 *   registryAddress: '0x...', // parent registry
 *   label: 'mysubname',
 *   owner: '0x...', // current owner of the subname
 * })
 * // 0x...
 */
export async function deleteSubnameV2<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    registryAddress,
    label,
    owner,
    ...txArgs
  }: DeleteSubnameV2Parameters<chain, account, chainOverride>,
): Promise<DeleteSubnameV2ReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = deleteSubnameV2WriteParameters(
    clientWithOverrides(client, txArgs),
    {
      registryAddress,
      label,
      owner,
    },
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
