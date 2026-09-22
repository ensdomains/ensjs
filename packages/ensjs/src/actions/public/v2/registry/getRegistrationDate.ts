import {
  type Address,
  type Chain,
  type GetBlockErrorType,
  type GetLogsErrorType,
  labelhash,
} from 'viem'
import { getBlock, getLogs } from 'viem/actions'
import { type GetChainContractAddressErrorType, getAction } from 'viem/utils'
import type { RequireClientContracts } from '../../../../clients/shared.js'
import { getChainContractAddress } from '../../../../clients/shared.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../../types/internal.js'

export type GetRegistrationDateParameters = {
  /** Label to get registration date for */
  label: string
  /** Optional custom registry address (ETHRegistry) */
  registryAddress?: Address
  /** Block range start */
  fromBlock?: bigint
  /** Block range end */
  toBlock?: bigint
}

export type GetRegistrationDateReturnType = bigint | null

export type GetRegistrationDateErrorType =
  | GetChainContractAddressErrorType
  | GetLogsErrorType
  | GetBlockErrorType

const LABEL_REGISTERED_EVENT = {
  name: 'LabelRegistered' as const,
  type: 'event' as const,
  inputs: [
    { name: 'tokenId', type: 'uint256', indexed: true },
    { name: 'labelHash', type: 'bytes32', indexed: true },
    { name: 'label', type: 'string', indexed: false },
    { name: 'owner', type: 'address', indexed: false },
    { name: 'expiry', type: 'uint64', indexed: false },
    { name: 'sender', type: 'address', indexed: true },
  ],
}

/**
 * Get a block timestamp of when a name was registered on the V2 registry
 * @returns registration timestamp or null
 */
export async function getRegistrationDate<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensRegistry'>,
  { label, registryAddress, fromBlock, toBlock }: GetRegistrationDateParameters,
): Promise<GetRegistrationDateReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const getLogsAction = getAction(client, getLogs, 'getLogs')

  const registry =
    registryAddress ??
    getChainContractAddress({
      chain: client.chain,
      contract: 'ensRegistry',
    })

  // Matched on `labelHash`, not `tokenId`: a token id carries a version in its
  // low bits which increments when a name is re-registered, so the id the
  // registry reports today does not match the one its own registration event
  // was emitted with. `labelHash` is indexed and version-free.
  const logs = await getLogsAction({
    address: registry,
    event: LABEL_REGISTERED_EVENT,
    args: { labelHash: labelhash(label) },
    fromBlock: fromBlock ?? 0n,
    toBlock: toBlock ?? undefined,
  })

  const lastLog = logs.at(-1)

  if (!lastLog) return null

  const { blockNumber } = lastLog

  if (!blockNumber) return null

  const getBlockAction = getAction(client, getBlock, 'getBlock')

  const { timestamp } = await getBlockAction({ blockNumber })

  return timestamp
}
