import type {
  Client,
  GetLogsErrorType,
  GetLogsParameters,
  GetLogsReturnType,
} from 'viem'
import type { Address } from 'viem/accounts'
import { getLogs } from 'viem/actions'
import { getAction } from 'viem/utils'
import { eacRolesEvents } from '../../../contracts/permissionedRegistry.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import { labelToCanonicalId } from '../../../utils/v2/registry/labelToCanonicalId.js'
import { getRegistryNameData } from './getRegistryNameData.js'

export type GetRoleAccountsParameters = {
  registryAddress: Address
  label: string
} & Pick<GetLogsParameters, 'fromBlock' | 'toBlock'>

export type GetRoleAccountsReturnType = GetLogsReturnType

export type GetRoleAccountsErrorType = GetLogsErrorType

/**
 * Get registry role events for a name
 * @param client - {@link Client}
 * @param parameters - {@link getRoleAccountsParameters}
 * @returns Filtered logs {@link getRoleAccountsReturnType}
 *
 */
export async function getRoleAccounts(
  client: Client,
  { registryAddress, label, ...params }: GetRoleAccountsParameters,
): Promise<GetRoleAccountsReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const getLogsAction = getAction(client, getLogs, 'getLogs')

  const getRegistryNameDataAction = getAction(
    client,
    getRegistryNameData,
    'getRegistryNameData',
  )

  const [_, entry] = await getRegistryNameDataAction({ label, registryAddress })

  const resource = labelToCanonicalId(label) | BigInt(entry.eacVersionId)

  const logs = await getLogsAction({
    ...params,
    address: registryAddress,
    events: eacRolesEvents,
    args: {
      resource,
    },
  })

  console.log(logs.map(({eventName, topics, blockNumber, args }) => ({eventName, topics, blockNumber, args })))

  const roles = new Map<Address, bigint>

  for (const log of logs) {
    if (log.eventName === 'EACRolesGranted') {
      // biome-ignore lint/style/noNonNullAssertion: always defined for a granted event
      roles.set(log.args.account!, log.args.roleBitmap!)
    } else if (log.eventName === 'EACRolesRevoked') {
       // biome-ignore lint/style/noNonNullAssertion: always defined for a revoked event
      roles.delete(log.args.account!)
    }
  }

  return roles
}
