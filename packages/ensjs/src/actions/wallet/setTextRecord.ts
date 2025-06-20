import type {
  Account,
  Address,
  Chain,
  Client,
  Transport,
  WriteContractErrorType,
  WriteContractParameters,
  WriteContractReturnType,
} from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import type { Prettify, WriteTransactionParameters } from '../../types/index.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../utils/clientWithOverrides.js'
import {
  type SetTextParametersErrorType,
  type SetTextParametersReturnType,
  setTextParameters,
} from '../../utils/coders/setText.js'
import { type NamehashErrorType, namehash } from '../../utils/name/namehash.js'

export type SetTextRecordWriteParametersParameters = {
  /** The name to set a text record for */
  name: string
  /** The text record key to set */
  key: string
  /** The text record value to set */
  value: string | null
  /** The resolver address to use */
  resolverAddress: Address
}

export type SetTextRecordWriteParametersReturnType = ReturnType<
  typeof setTextRecordWriteParameters
>

export type SetTextRecordWriteParametersErrorType =
  | SetTextParametersErrorType
  | NamehashErrorType

export const setTextRecordWriteParameters = <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  { name, key, value, resolverAddress }: SetTextRecordWriteParametersParameters,
) => {
  return {
    address: resolverAddress,
    chain: client.chain,
    account: client.account,
    ...setTextParameters({ namehash: namehash(name), key, value }),
  } as const satisfies WriteContractParameters<
    SetTextParametersReturnType['abi']
  >
}

// ================================
// Action
// ================================

export type SetTextRecordParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain,
> = Prettify<
  SetTextRecordWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type SetTextRecordReturnType = WriteContractReturnType

export type SetTextRecordErrorType =
  | SetTextRecordWriteParametersErrorType
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Sets a text record for a name on a resolver.
 * @param client - {@link Client}
 * @param options - {@link SetTextRecordOptions}
 * @returns Transaction hash. {@link SetTextRecordReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { setTextRecord } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await setTextRecord(wallet, {
 *   name: 'ens.eth',
 *   key: 'foo',
 *   value: 'bar',
 *   resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
 * })
 * // 0x...
 */
export async function setTextRecord<
  chain extends Chain,
  account extends Account,
  chainOverride extends Chain,
>(
  client: Client<Transport, chain, account>,
  {
    name,
    key,
    value,
    resolverAddress,
    ...txArgs
  }: SetTextRecordParameters<chain, account, chainOverride>,
): Promise<SetTextRecordReturnType> {
  const writeParameters = setTextRecordWriteParameters(
    clientWithOverrides(client, txArgs),
    {
      name,
      key,
      value,
      resolverAddress,
    },
  )
  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
