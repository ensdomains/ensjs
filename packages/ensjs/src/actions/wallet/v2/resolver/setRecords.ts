import { permissionedResolverMulticallSnippet } from '@ensdomains/ensjs-abi/v2/permissionedResolver'
import type {
  Account,
  Address,
  Chain,
  Client,
  EncodeFunctionDataErrorType,
  EncodeFunctionDataParameters,
  Transport,
  WriteContractErrorType,
  WriteContractParameters,
  WriteContractReturnType,
} from 'viem'
import { encodeFunctionData } from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { NoRecordsSpecifiedError } from '../../../../errors/public.js'
import type {
  Prettify,
  WriteTransactionParameters,
} from '../../../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../../types/internal.js'
import { clientWithOverrides } from '../../../../utils/clientWithOverrides.js'
import {
  type RecordOptions,
  type ResolverMulticallParametersErrorType,
  resolverMulticallParameters,
} from '../../../../utils/v2/resolver/recordParameters.js'

// ================================
// Write parameters
// ================================

export type SetRecordsWriteParametersParameters = Prettify<
  {
    /** The name to set records for */
    name: string
    /** The PermissionedResolver address */
    resolverAddress: Address
  } & RecordOptions
>

export type SetRecordsWriteParametersReturnType = ReturnType<
  typeof setRecordsWriteParameters
>

export type SetRecordsWriteParametersErrorType =
  | NoRecordsSpecifiedError
  | ResolverMulticallParametersErrorType
  | EncodeFunctionDataErrorType

export const setRecordsWriteParameters = async <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  { name, resolverAddress, ...records }: SetRecordsWriteParametersParameters,
) => {
  const callArray = await resolverMulticallParameters({ name, ...records })
  if (callArray.length === 0) throw new NoRecordsSpecifiedError()

  const baseParams = {
    address: resolverAddress,
    account: client.account,
    chain: client.chain,
  } as const

  if (callArray.length === 1)
    return {
      ...baseParams,
      ...callArray[0],
    } as WriteContractParameters

  return {
    ...baseParams,
    abi: permissionedResolverMulticallSnippet,
    functionName: 'multicall',
    args: [
      callArray.map((call) =>
        encodeFunctionData(call as EncodeFunctionDataParameters),
      ),
    ],
  } as const satisfies WriteContractParameters<
    typeof permissionedResolverMulticallSnippet
  >
}

// ================================
// Action
// ================================

export type SetRecordsParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
> = Prettify<
  SetRecordsWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type SetRecordsReturnType = WriteContractReturnType

export type SetRecordsErrorType =
  | SetRecordsWriteParametersErrorType
  | WriteContractErrorType

/**
 * Sets records for a name on a PermissionedResolver (V2).
 *
 * The V2 setters address records by DNS-encoded name (`setAddress(name, ...)`,
 * `setText(name, ...)`), not by `bytes32` node, so this is not interchangeable
 * with the V1 `setRecords`. A single change is sent as the setter call itself,
 * several changes as one `multicall`. There is no "clear all"; unlink the name
 * with `linkToRecord` instead.
 *
 * @param client - {@link Client}
 * @param parameters - {@link SetRecordsParameters}
 * @returns Transaction hash. {@link SetRecordsReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { setRecords } from '@ensdomains/ensjs/wallet/v2'
 *
 * const wallet = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await setRecords(wallet, {
 *   name: 'ens.eth',
 *   resolverAddress: '0x...',
 *   coins: [{ coin: 'ETH', value: '0x...' }],
 *   texts: [{ key: 'avatar', value: 'https://...' }],
 * })
 * // 0x...
 */
export async function setRecords<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    name,
    resolverAddress,
    contentHash,
    texts,
    coins,
    abi,
    ...txArgs
  }: SetRecordsParameters<chain, account, chainOverride>,
): Promise<SetRecordsReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const writeParameters = await setRecordsWriteParameters(
    clientWithOverrides(client, txArgs),
    { name, resolverAddress, contentHash, texts, coins, abi },
  )

  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
