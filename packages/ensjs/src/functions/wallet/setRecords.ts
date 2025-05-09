import {
  encodeFunctionData,
  type Account,
  type Address,
  type Chain,
  type Client,
  type EncodeFunctionDataParameters,
  type Transport,
  type WriteContractParameters,
  type WriteContractReturnType,
} from 'viem'
import { writeContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { publicResolverMulticallSnippet } from '../../contracts/publicResolver.js'
import { NoRecordsSpecifiedError } from '../../errors/public.js'
import type {
  Prettify,
  SimpleTransactionRequest,
  WriteTransactionParameters,
} from '../../types.js'
import { clientWithOverrides } from '../../utils/clientWithOverrides.js'
import {
  resolverMulticallParameters,
  type RecordOptions,
} from '../../utils/coders/resolverMulticallParameters.js'
import { namehash } from '../../utils/name/normalise.js'

export type SetRecordsParameters = {
  /** The name to set records for */
  name: string
  /** The resolver address to set records on */
  resolverAddress: Address
} & RecordOptions

export type SetRecordsDataReturnType = SimpleTransactionRequest

export type SetRecordsOptions<
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined,
> = Prettify<
  SetRecordsParameters &
    WriteTransactionParameters<chain, account, chainOverride>
>

export type SetRecordsReturnType = WriteContractReturnType

export type SetRecordsErrorType = NoRecordsSpecifiedError | Error

export const setRecordsWriteParameters = async <
  chain extends Chain,
  account extends Account,
>(
  client: Client<Transport, chain, account>,
  { name, resolverAddress, ...records }: SetRecordsParameters,
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
  chain extends Chain | undefined,
  account extends Account | undefined,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  {
    name,
    resolverAddress,
    clearRecords,
    contentHash,
    texts,
    coins,
    abi,
    ...txArgs
  }: SetRecordsOptions<chain, account, chainOverride>,
): Promise<SetRecordsReturnType> {
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
