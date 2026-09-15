import { permissionedResolverMulticallSnippet } from '@ensdomains/ensjs-abi/v2/permissionedResolver'
import {
  type Account,
  type Address,
  type Chain,
  type Client,
  type EncodeFunctionDataErrorType,
  type EncodeFunctionDataParameters,
  encodeFunctionData,
  type Transport,
  type WriteContractErrorType,
  type WriteContractParameters,
  type WriteContractReturnType,
} from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { NoRecordsSpecifiedError } from '../../../../errors/public.js'
import type {
  Prettify,
  WriteTransactionParameters,
} from '../../../../types/index.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../../../utils/clientWithOverrides.js'
import {
  type RecordOptions,
  type ResolverMulticallItemErrorType,
  resolverMulticallParameters,
} from '../../../../utils/v2/resolver/resolverMulticallParameters.js'

// ================================
// Write parameters
// ================================

export type SetRecordsWriteParametersParameters = {
  /** The name to set records for */
  name: string
  /** The resolver address to set records on */
  resolverAddress: Address
} & RecordOptions

export type SetRecordsWriteParametersReturnType = ReturnType<
  typeof setRecordsWriteParameters
>

export type SetRecordsWriteParametersErrorType =
  | NoRecordsSpecifiedError
  | ResolverMulticallItemErrorType
  | EncodeFunctionDataErrorType

/**
 * Builds the write parameters for setting records on a V2
 * `PermissionedResolver`.
 *
 * A single change goes out as the bare setter; several are batched through
 * `multicall(bytes[])`. Unlike the v1 equivalent, no node argument is needed —
 * every setter already carries the DNS-encoded name.
 */
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

  const encodedCalls = callArray.map((call) =>
    encodeFunctionData(call as EncodeFunctionDataParameters),
  )

  return {
    ...baseParams,
    abi: permissionedResolverMulticallSnippet,
    functionName: 'multicall',
    args: [encodedCalls],
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
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Sets multiple records for a name on a V2 `PermissionedResolver`.
 *
 * @param client - {@link Client}
 * @param options - {@link SetRecordsParameters}
 * @returns Transaction hash. {@link SetRecordsReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { sepolia } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { setRecords } from '@ensdomains/ensjs/wallet/v2'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(sepolia),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await setRecords(wallet, {
 *   name: 'ens.eth',
 *   coins: [{ coin: 'ETH', value: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7' }],
 *   texts: [{ key: 'foo', value: 'bar' }],
 *   resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
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
