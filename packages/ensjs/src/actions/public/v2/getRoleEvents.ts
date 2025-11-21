import type {
  Client,
  CreateContractEventFilterErrorType,
  CreateContractEventFilterParameters,
  GetFilterLogsErrorType,
  Log,
} from 'viem'
import type { Address } from 'viem/accounts'
import { createContractEventFilter, getFilterLogs } from 'viem/actions'
import { getAction } from 'viem/utils'
import { eacRolesEvents } from '../../../contracts/permissionedRegistry.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import { labelToCanonicalId } from '../../../utils/v2/registry/labelToCanonicalId.js'
import { getRegistryNameData } from './getRegistryNameData.js'

export type GetRoleEventsParameters = {
  registryAddress: Address
  label: string
} & Omit<CreateContractEventFilterParameters, 'address' | 'abi'>

export type GetRoleEventsReturnType = Log[]

export type GetRoleEventsErrorType =
  | CreateContractEventFilterErrorType
  | GetFilterLogsErrorType

/**
 * Get registry role events for a name
 * @param client - {@link Client}
 * @param parameters - {@link GetRoleEventsParameters}
 * @returns Filtered logs {@link GetRoleEventsReturnType}
 *
 */
export async function getRoleEvents(
  client: Client,
  { registryAddress, label, ...params }: GetRoleEventsParameters,
): Promise<GetRoleEventsReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const createContractEventFilterAction = getAction(
    client,
    createContractEventFilter,
    'createContractEventFilter',
  )
  const getFilterLogsAction = getAction(client, getFilterLogs, 'getFilterLogs')

  const getRegistryNameDataAction = getAction(
    client,
    getRegistryNameData,
    'getRegistryNameData',
  )

  const [_, entry] = await getRegistryNameDataAction({ label, registryAddress })

  const resource = labelToCanonicalId(label) | BigInt(entry.eacVersionId)

  const filter = await createContractEventFilterAction({
    ...params,
    address: registryAddress,
    abi: eacRolesEvents,
    eventName: 'EACRolesGranted',
    args: {
      resource,
    },
  })

  return getFilterLogsAction({ filter })
}
