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
import { isAddress } from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import type { Prettify, WriteTransactionParameters } from '../../types/index.js'
import {
  type ClientWithOverridesErrorType,
  clientWithOverrides,
} from '../../utils/clientWithOverrides.js'
import type { AbiEncodeAs } from '../../utils/coders/encodeAbi.js'
import {
  type SetAbiParameters,
  type SetAbiParametersErrorType,
  type SetAbiParametersReturnType,
  setAbiParameters,
} from '../../utils/coders/setAbi.js'
import { type NamehashErrorType, namehash } from '../../utils/name/namehash.js'


// export type SetAbiRecordParameters<encodeAs extends AbiEncodeAs = AbiEncodeAs> =
// 	Prettify<
// 		EncodeAbiParameters<encodeAs> & {
// 			/** Name to set ABI for */
// 			name: string;
// 			/** Resolver address to set ABI on */
// 			resolverAddress: Address;
// 		}
// 	>;

// export type SetAbiRecordOptions<
// 	encodeAs extends AbiEncodeAs,
// 	chain extends Chain | undefined,
// 	account extends Account | undefined,
// 	chainOverride extends Chain | undefined,
// > = Prettify<
// 	SetAbiRecordParameters<encodeAs> &
// 		WriteTransactionParameters<chain, account, chainOverride>
// >;

// export type SetAbiRecordReturnType = WriteContractReturnType;

// export type SetAbiRecordErrorType = Error;

// ================================
// Write parameters
// ================================

export type SetAbiRecordWriteParametersParameters<
  encodeAs extends AbiEncodeAs,
> = Prettify<
  SetAbiParameters<encodeAs> & {
    /** Name to set ABI for. If not provided, uses dedicated resolver. */
    name?: string
    /** Resolver address to set ABI on */
    resolverAddress: Address
  }
>

export type SetAbiRecordWriteParametersReturnType = ReturnType<
  typeof setAbiRecordWriteParameters
>

export type SetAbiRecordWriteParametersErrorType =
  | SetAbiParametersErrorType
  | NamehashErrorType

export const setAbiRecordWriteParameters = async <
  encodeAs extends AbiEncodeAs,
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  {
    name,
    data,
    encodeAs,
    resolverAddress,
  }: SetAbiRecordWriteParametersParameters<encodeAs>,
) => {
  if (!isAddress(resolverAddress)) {
    throw new Error(`Invalid resolver address: ${resolverAddress}`)
  }

  return {
    address: resolverAddress,
    chain: client.chain,
    account: client.account,
    ...(await setAbiParameters({
      namehash: name ? namehash(name) : undefined,
      data,
      encodeAs,
    } as SetAbiParameters<encodeAs>)),
  } as const satisfies WriteContractParameters<
    SetAbiParametersReturnType['abi']
  >
}

// ================================
// Action
// ================================

export type SetAbiRecordParameters<
  encodeAs extends AbiEncodeAs,
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined,
> = SetAbiRecordWriteParametersParameters<encodeAs> &
  WriteTransactionParameters<chain, account, chainOverride>

export type SetAbiRecordReturnType = WriteContractReturnType

export type SetAbiRecordErrorType =
  | SetAbiRecordWriteParametersErrorType
  | ClientWithOverridesErrorType
  | WriteContractErrorType

/**
 * Sets the ABI for a name on a resolver.
 * Uses the dedicated resolver when name is not provided, otherwise uses the legacy resolver.
 * @param client - {@link Client}
 * @param options - {@link SetAbiRecordParameters}
 * @returns Transaction hash. {@link SetAbiRecordReturnType}
 *
 * @example
 * import abi from './abi.json'
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { encodeAbi } from '@ensdomains/ensjs/utils'
 * import { setAbiRecord } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 *
 * const encodedAbi = await encodeAbi({ encodeAs: 'json', abi })
 *
 * // Legacy resolver usage (with name)
 * const hash = await setAbiRecord(wallet, {
 *   name: 'ens.eth',
 *   data: encodedAbi,
 *   encodeAs: 'json',
 *   resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
 * })
 *
 * // Dedicated resolver usage (without name)
 * const hash2 = await setAbiRecord(wallet, {
 *   data: encodedAbi,
 *   encodeAs: 'json',
 *   resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
 * })
 * // 0x...
 */
export async function setAbiRecord<
  encodeAs extends AbiEncodeAs,
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    name,
    data,
    encodeAs,
    resolverAddress,
    ...txArgs
  }: SetAbiRecordParameters<encodeAs, chain, account, chainOverride>,
): Promise<SetAbiRecordReturnType> {
  const writeParameters = await setAbiRecordWriteParameters(
    clientWithOverrides(client, txArgs),
    {
      name,
      data,
      encodeAs,
      resolverAddress,
    } as SetAbiRecordWriteParametersParameters<encodeAs>,
  )
  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
