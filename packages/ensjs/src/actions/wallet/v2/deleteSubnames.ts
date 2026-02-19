import type {
  Account,
  Address,
  Chain,
  Client,
  Hash,
  Hex,
  Transport,
  WriteContractErrorType,
  WriteContractParameters,
} from 'viem'
import { labelhash, zeroAddress } from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { erc1155SafeBatchTransferFromSnippet } from '../../../contracts/erc1155.js'
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

export type DeleteSubnamesWriteParametersParameters = {
  /** The parent registry address */
  registryAddress: Address
  /** The labels of the subnames to delete */
  labels: string[]
  /** The owner address of the subnames (account to burn from) */
  owner: Address
  /** Optional data to pass to the transfer (defaults to empty) */
  data?: Hex
}

export type DeleteSubnamesV2WriteParametersReturnType = ReturnType<
  typeof deleteSubnamesV2WriteParameters
>

export const deleteSubnamesV2WriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  {
    registryAddress,
    labels,
    owner,
    data = '0x',
  }: DeleteSubnamesWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  // Convert labels to tokenIds (labelhashes)
  const ids = labels.map((label) => BigInt(labelhash(label)))
  // Each subname token has a value of 1
  const values = labels.map(() => 1n)

  return {
    address: registryAddress,
    abi: erc1155SafeBatchTransferFromSnippet,
    functionName: 'safeBatchTransferFrom',
    // Transfer to address(0) burns the tokens
    args: [owner, zeroAddress, ids, values, data],
    chain: client.chain,
    account: client.account,
  } as const satisfies WriteContractParameters<
    typeof erc1155SafeBatchTransferFromSnippet
  >
}

// ================================
// Action
// ================================

export type DeleteSubnamesV2Parameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
> = Prettify<
  DeleteSubnamesWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type DeleteSubnamesV2ReturnType = Hash

export type DeleteSubnamesV2ErrorType =
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Deletes multiple subnames by batch burning their ERC1155 tokens in the parent registry (V2).
 *
 * In ENSv2, subnames are ERC1155 tokens managed by their parent registry.
 * This function uses `safeBatchTransferFrom` to transfer tokens to address(0),
 * which internally burns them all in a single transaction.
 *
 * @param client - {@link Client}
 * @param parameters - {@link DeleteSubnamesV2Parameters}
 * @returns Transaction hash. {@link DeleteSubnamesV2ReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { deleteSubnamesV2 } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await deleteSubnamesV2(wallet, {
 *   registryAddress: '0x...', // parent registry
 *   labels: ['sub1', 'sub2', 'sub3'],
 *   owner: '0x...', // current owner of the subnames
 * })
 * // 0x...
 */
export async function deleteSubnamesV2<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    registryAddress,
    labels,
    owner,
    data,
    ...txArgs
  }: DeleteSubnamesV2Parameters<chain, account, chainOverride>,
): Promise<DeleteSubnamesV2ReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = deleteSubnamesV2WriteParameters(
    clientWithOverrides(client, txArgs),
    {
      registryAddress,
      labels,
      owner,
      data,
    },
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
