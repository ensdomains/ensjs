import {
  type Client,
  type GetLogsErrorType,
  type GetLogsParameters,
  zeroAddress,
} from 'viem'
import type { Address } from 'viem/accounts'
import { getLogs } from 'viem/actions'
import { getAction } from 'viem/utils'
import { eacRolesEvents } from '../../../contracts/permissionedRegistry.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import { REGISTRY_ROLES } from '../../../utils/v2/index.js'
import { labelToCanonicalId } from '../../../utils/v2/registry/labelToCanonicalId.js'
import {
  decodeRoleCounts,
  type RoleName,
} from '../../../utils/v2/roles/decodeRoleCounts.js'
import { getRegistryNameData } from './getRegistryNameData.js'

export type GetNameRolesAccountsParameters = {
  registryAddress: Address
  label: string
} & Pick<GetLogsParameters, 'fromBlock' | 'toBlock'>

export type GetNameRolesAccountsReturnType = Map<
  Address,
  RoleName<readonly string[]>[]
>

export type GetNameRolesAccountsErrorType = GetLogsErrorType

/**
 * Get registry role accounts for a name
 * @param client - {@link Client}
 * @param parameters - {@link GetNameRolesAccountsParameters}
 * @returns Filtered logs {@link GetNameRolesAccountsReturnType}
 *
 */
export async function getNameRoleAccounts(
  client: Client,
  { registryAddress, label, ...params }: GetNameRolesAccountsParameters,
): Promise<GetNameRolesAccountsReturnType> {
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
    // @ts-expect-error viem type error
    args: {
      resource,
    },
  })

  const roles = new Map<Address, RoleName<readonly string[]>[]>()

  for (const log of logs) {
    if (log.args.account && log.args.account !== zeroAddress) {
      if (log.eventName === 'EACRolesGranted') {
        // biome-ignore lint/style/noNonNullAssertion: always defined for a granted event
        const bitmap = log.args.roleBitmap!
        const counts = decodeRoleCounts(REGISTRY_ROLES, bitmap)

        roles.set(
          log.args.account,
          Object.keys(counts).filter(
            (key) => counts[key as keyof typeof counts] === 1,
          ),
        )
      } else if (log.eventName === 'EACRolesRevoked') {
        roles.delete(log.args.account)
      }
    }
  }

  return roles
}
