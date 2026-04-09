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
import { packetToBytes } from 'viem/ens'
import { getAction, toHex } from 'viem/utils'
import { permissionedResolverAliasSnippet } from '@ensdomains/ensjs-abi/v2/permissionedResolver'
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

export type SetAliasWriteParametersParameters = {
  /** The source name to alias from */
  fromName: string
  /** The target name to alias to */
  toName: string
  /** The resolver address */
  resolverAddress: Address
}

export type SetAliasWriteParametersReturnType = ReturnType<
  typeof setAliasWriteParameters
>

export const setAliasWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  { fromName, toName, resolverAddress }: SetAliasWriteParametersParameters,
) => {
  ASSERT_NO_TYPE_ERROR(client)

  const fromNameEncoded = toHex(packetToBytes(fromName))
  const toNameEncoded = toHex(packetToBytes(toName))

  return {
    address: resolverAddress,
    abi: permissionedResolverAliasSnippet,
    functionName: 'setAlias',
    args: [fromNameEncoded, toNameEncoded],
    chain: client.chain,
    account: client.account,
  } as const satisfies WriteContractParameters<
    typeof permissionedResolverAliasSnippet
  >
}

// ================================
// Action
// ================================

export type SetAliasParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
> = Prettify<
  SetAliasWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type SetAliasReturnType = Hash

export type SetAliasErrorType =
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Sets an alias from one name to another in the resolver (V2).
 *
 * @param client - {@link Client}
 * @param parameters - {@link SetAliasParameters}
 * @returns Transaction hash. {@link SetAliasReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { setAlias } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await setAlias(wallet, {
 *   fromName: 'alias.eth',
 *   toName: 'target.eth',
 *   resolverAddress: '0x...',
 * })
 * // 0x...
 */
export async function setAlias<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    fromName,
    toName,
    resolverAddress,
    ...txArgs
  }: SetAliasParameters<chain, account, chainOverride>,
): Promise<SetAliasReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = setAliasWriteParameters(
    clientWithOverrides(client, txArgs),
    {
      fromName,
      toName,
      resolverAddress,
    },
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
