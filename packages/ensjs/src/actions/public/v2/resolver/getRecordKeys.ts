import {
  permissionedResolverEventsSnippet,
  permissionedResolverGetRecordIdSnippet,
} from '@ensdomains/ensjs-abi/v2/permissionedResolver'
import {
  type Client,
  type GetLogsErrorType,
  type GetLogsParameters,
  getAbiItem,
  namehash,
  zeroHash,
} from 'viem'
import type { Address } from 'viem/accounts'
import { getLogs, type ReadContractErrorType, readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { ASSERT_NO_TYPE_ERROR } from '../../../../types/internal.js'

const textUpdatedEvent = getAbiItem({
  abi: permissionedResolverEventsSnippet,
  name: 'TextUpdated',
})
const addressUpdatedEvent = getAbiItem({
  abi: permissionedResolverEventsSnippet,
  name: 'AddressUpdated',
})

export type GetRecordKeysParameters = {
  /** The permissioned resolver to read */
  resolverAddress: Address
  /** The name to get record keys for */
  name: string
} & Partial<Pick<GetLogsParameters, 'fromBlock' | 'toBlock'>>

export type GetRecordKeysReturnType = {
  /** Text keys with a non-empty value */
  texts: string[]
  /** Coin types with a non-empty address */
  coinTypes: bigint[]
}

export type GetRecordKeysErrorType = ReadContractErrorType | GetLogsErrorType

/** The keys whose latest value is set, in first-written order. */
const setKeys = <K>(entries: readonly (readonly [K, boolean])[]): K[] =>
  [...new Map(entries)].flatMap(([key, isSet]) => (isSet ? [key] : []))

/**
 * Gets the text keys and coin types a permissioned resolver holds for a name,
 * from its `TextUpdated` and `AddressUpdated` events. Works for names the
 * resolver answers as a wildcard, which have no registry entry of their own.
 * An unlinked name reads the resolver's default record, as `resolve` does.
 * @param client - {@link Client}
 * @param parameters - {@link GetRecordKeysParameters}
 * @returns The keys with a value set. {@link GetRecordKeysReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getRecordKeys } from '@ensdomains/ensjs/public/v2'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const keys = await getRecordKeys(client, {
 *   resolverAddress: '0x...',
 *   name: 'sub.example.eth',
 * })
 * // { texts: ['description'], coinTypes: [60n] }
 */
export async function getRecordKeys(
  client: Client,
  { resolverAddress, name, fromBlock, toBlock }: GetRecordKeysParameters,
): Promise<GetRecordKeysReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')
  const getLogsAction = getAction(client, getLogs, 'getLogs')

  const getRecordId = (node: `0x${string}`) =>
    readContractAction({
      address: resolverAddress,
      abi: permissionedResolverGetRecordIdSnippet,
      functionName: 'getRecordId',
      args: [node],
    })

  const linkedRecordId = await getRecordId(namehash(name))
  const recordId =
    linkedRecordId === 0n ? await getRecordId(zeroHash) : linkedRecordId
  if (recordId === 0n) return { texts: [], coinTypes: [] }

  const range = { fromBlock: fromBlock ?? 0n, toBlock }
  const [textLogs, addressLogs] = await Promise.all([
    getLogsAction({
      address: resolverAddress,
      event: textUpdatedEvent,
      args: { recordId },
      ...range,
    }),
    getLogsAction({
      address: resolverAddress,
      event: addressUpdatedEvent,
      args: { recordId },
      ...range,
    }),
  ])

  return {
    texts: setKeys(
      textLogs.flatMap(({ args }) =>
        args.key === undefined ? [] : [[args.key, !!args.value] as const],
      ),
    ),
    coinTypes: setKeys(
      addressLogs.flatMap(({ args }) =>
        args.coinType === undefined
          ? []
          : [
              [
                args.coinType,
                !!args.addressBytes && args.addressBytes !== '0x',
              ] as const,
            ],
      ),
    ),
  }
}
