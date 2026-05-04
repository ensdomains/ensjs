import {
  eacRolesEvents,
  permissionedRegistryGetStateSnippet,
} from '@ensdomains/ensjs-abi/v2/permissionedRegistry'
import {
  type Client,
  type GetLogsErrorType,
  type GetLogsParameters,
  labelhash,
  zeroAddress,
} from 'viem'
import type { Address } from 'viem/accounts'
import { getLogs, readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import { registryRoles } from '../../../utils/v2/index.js'
import {
  decodeRoleCounts,
  type RoleName,
} from '../../../utils/v2/roles/decodeRoleCounts.js'

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

  const readContractAction = getAction(client, readContract, 'readContract')
  const getLogsAction = getAction(client, getLogs, 'getLogs')

  const labelHash = BigInt(labelhash(label))

  const state = await readContractAction({
    address: registryAddress,
    abi: permissionedRegistryGetStateSnippet,
    functionName: 'getState',
    args: [labelHash],
  })

  const resource = state.resource

  const logs = await getLogsAction({
    address: registryAddress,
    events: eacRolesEvents,
    fromBlock: params.fromBlock ?? 0n,
    toBlock: params.toBlock ?? undefined,
    // @ts-expect-error viem type error
    args: {
      resource,
    },
  })

  const roles = new Map<Address, RoleName<readonly string[]>[]>()

  for (const log of logs) {
    if (log.args.account && log.args.account !== zeroAddress) {
      if (log.eventName === 'EACRolesChanged') {
        const bitmap = log.args.newRoleBitmap!
        const counts = decodeRoleCounts(bitmap, registryRoles)

        roles.set(
          log.args.account,
          Object.keys(counts).filter(
            (key) => counts[key as keyof typeof counts] === 1,
          ),
        )
      }
    }
  }

  return roles
}
