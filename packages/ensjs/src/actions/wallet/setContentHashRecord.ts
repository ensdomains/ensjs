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
import type { Prettify, WriteTransactionParameters } from '../../types/index.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../utils/clientWithOverrides.js'
import {
  type SetContentHashParametersErrorType,
  type SetContentHashParametersReturnType,
  setContentHashParameters,
} from '../../utils/coders/setContentHash.js'
import { type NamehashErrorType, namehash } from '../../utils/name/namehash.js'

// ================================
// Write Parameters
// ================================

export type SetContentHashRecordWriteParametersParameters = {
  /** Name to set content hash for */
  name?: string
  /** Content hash value */
  contentHash: string | null
  /** The resolver address to use */
  resolverAddress: Address
}

export type SetContentHashRecordWriteParametersErrorType =
  | SetContentHashParametersErrorType
  | NamehashErrorType

export const setContentHashRecordWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  {
    name,
    contentHash,
    resolverAddress,
  }: SetContentHashRecordWriteParametersParameters,
) => {
  return {
    address: resolverAddress,
    chain: client.chain,
    account: client.account,
    ...setContentHashParameters(
      typeof name === 'string'
        ? { namehash: namehash(name), contentHash }
        : { contentHash },
    ),
  } as const satisfies WriteContractParameters<
    SetContentHashParametersReturnType['abi']
  >
}

// ================================
// Action
// ================================

export type SetContentHashRecordParameters<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined,
> = Prettify<
  SetContentHashRecordWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type SetContentHashRecordReturnType = Hash

export type SetContentHashRecordErrorType =
  | SetContentHashRecordWriteParametersErrorType
  | ClientWithOverridesErrorType
  | WriteContractErrorType
/**
 * Sets the content hash record for a name on a resolver.
 * @param client - {@link Client}
 * @param options - {@link SetContentHashRecordOptions}
 * @returns Transaction hash. {@link SetContentHashRecordReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { setContentHashRecord } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await setContentHashRecord(wallet, {
 *   name: 'ens.eth',
 *   contentHash: 'ipns://k51qzi5uqu5djdczd6zw0grmo23j2vkj9uzvujencg15s5rlkq0ss4ivll8wqw',
 * })
 * // 0x...
 */
export async function setContentHashRecord<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    name,
    contentHash,
    resolverAddress,
    ...txArgs
  }: SetContentHashRecordParameters<chain, account, chainOverride>,
): Promise<SetContentHashRecordReturnType> {
  const data = setContentHashRecordWriteParameters(
    clientWithOverrides(client, txArgs),
    {
      name,
      contentHash,
      resolverAddress,
    },
  )
  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...data,
    ...txArgs,
  } as WriteContractParameters)
}
