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
import type {
  ChainWithContracts,
  RequireClientContracts,
} from '../../clients/chain.js'
import { publicResolverMulticallSnippet } from '../../contracts/publicResolver.js'
import { NoRecordsSpecifiedError } from '../../errors/public.js'
import type { Prettify, WriteTransactionParameters } from '../../types/index.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'
import { clientWithOverrides } from '../../utils/clientWithOverrides.js'
import {
  type RecordOptions,
  resolverMulticallParameters,
} from '../../utils/coders/resolverMulticallParameters.js'
import { type NamehashErrorType, namehash } from '../../utils/name/namehash.js'

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
  | NamehashErrorType
  | EncodeFunctionDataErrorType

export const setRecordsWriteParameters = async <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  { name, resolverAddress, ...records }: SetRecordsWriteParametersParameters,
) => {
  const callArray = await resolverMulticallParameters({
    namehash: namehash(name),
    ...records,
  })
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
    } as const satisfies WriteContractParameters
  return {
    ...baseParams,
    abi: publicResolverMulticallSnippet,
    functionName: 'multicall',
    args: [
      callArray.map((call) =>
        encodeFunctionData(call as EncodeFunctionDataParameters),
      ),
    ],
  } as const satisfies WriteContractParameters<
    typeof publicResolverMulticallSnippet
  >
}

// ================================
// Action
// ================================

export type SetRecordsParameters<
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<'ensPublicResolver'>,
> = Prettify<
  SetRecordsWriteParametersParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type SetRecordsReturnType = WriteContractReturnType

export type SetRecordsErrorType =
  | SetRecordsWriteParametersErrorType
  | WriteContractErrorType

/**
 * Sets multiple records for a name on a resolver.
 * @param client - {@link Client}
 * @param options - {@link SetRecordsOptions}
 * @returns Transaction hash. {@link SetRecordsReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { setRecords } from '@ensdomains/ensjs/wallet'
 *
 * const wallet = createWalletClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: custom(window.ethereum),
 * })
 * const hash = await setRecords(wallet, {
 *   name: 'ens.eth',
 *   coins: [
 *     {
 *       coin: 'ETH',
 *       value: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
 *     },
 *   ],
 *   texts: [{ key: 'foo', value: 'bar' }],
 *   resolverAddress: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
 * })
 * // 0x...
 */
export async function setRecords<
  chain extends Chain,
  account extends Account,
  chainOverride extends ChainWithContracts<'ensPublicResolver'>,
>(
  client: RequireClientContracts<chain, 'ensPublicResolver', account>,
  {
    name,
    resolverAddress,
    clearRecords,
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
    {
      name,
      resolverAddress,
      clearRecords,
      contentHash,
      texts,
      coins,
      abi,
    },
  )
  const writeContractAction = getAction(client, writeContract, 'writeContract')
  return writeContractAction({
    ...writeParameters,
    ...txArgs,
  } as WriteContractParameters)
}
