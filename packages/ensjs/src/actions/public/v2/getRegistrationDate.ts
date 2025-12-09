import {
  type Chain,
  type CreateEventFilterErrorType,
  type CreateEventFilterParameters,
  type GetBlockErrorType,
  type GetFilterLogsErrorType,
  labelhash,
  type ReadContractErrorType,
} from 'viem'
import {
  createEventFilter,
  getBlock,
  getFilterLogs,
  readContract,
} from 'viem/actions'
import { type GetChainContractAddressErrorType, getAction } from 'viem/utils'
import type { RequireClientL2Contracts } from '../../../clients/l2.js'
import { getChainContractAddress } from '../../../clients/shared.js'
import {
  permissionedRegistryGetTokenIdSnippet,
  permissionedRegistryNameRegisteredEventSnippet,
} from '../../../contracts/permissionedRegistry.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'

export type GetRegistrationDateParameters = {
  label: string
} & Pick<CreateEventFilterParameters, 'fromBlock' | 'toBlock'>

export type GetRegistrationDateReturnType = bigint | null

export type GetRegistrationDateErrorType =
  | GetChainContractAddressErrorType
  | ReadContractErrorType
  | CreateEventFilterErrorType
  | GetFilterLogsErrorType
  | GetBlockErrorType

/**
 * Get a block timestamp of when a name was registered on Namechain
 * @returns registration timestamp or null
 */
export async function getRegistrationDate<chain extends Chain>(
  client: RequireClientL2Contracts<chain, 'ensV2EthRegistry'>,
  { label, ...params }: GetRegistrationDateParameters,
): Promise<GetRegistrationDateReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const createEventFilterAction = getAction(
    client,
    createEventFilter,
    'createEventFilter',
  )

  const getFilterLogsAction = getAction(client, getFilterLogs, 'getFilterLogs')

  const readContractAction = getAction(client, readContract, 'readContract')

  const address = getChainContractAddress({
    chain: client.chain,
    contract: 'ensV2EthRegistry',
  })

  const tokenId =
    (await readContractAction({
      address,
      abi: permissionedRegistryGetTokenIdSnippet,
      functionName: 'getTokenId',
      args: [BigInt(labelhash(label))],
    })) - 1n // NameRegistered always has tokenId-1

  const filter = await createEventFilterAction({
    ...params,
    address,
    event: permissionedRegistryNameRegisteredEventSnippet,
    args: {
      tokenId,
    },
  })

  const logs = await getFilterLogsAction({ filter })

  const lastLog = logs.at(-1)

  if (!lastLog) return null

  const { blockNumber } = lastLog

  if (!blockNumber) return null

  const getBlockAction = getAction(client, getBlock, 'getBlock')

  const { timestamp } = await getBlockAction({ blockNumber })

  return timestamp
}
