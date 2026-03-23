import type { Address, Client } from 'viem'
import { type ReadContractErrorType, readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { permissionedRegistryGetStateSnippet } from '../../../contracts/permissionedRegistry.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import { labelToCanonicalId } from '../../../utils/v2/registry/labelToCanonicalId.js'

export type GetOwnerParameters = {
  registryAddress: Address
  label: string
}

export type GetOwnerErrorType = ReadContractErrorType

export async function getOwner(
  client: Client,
  { registryAddress, label }: GetOwnerParameters,
): Promise<Address> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')

  const labelHash = labelToCanonicalId(label)

  const state = await readContractAction({
    address: registryAddress,
    abi: permissionedRegistryGetStateSnippet,
    functionName: 'getState',
    args: [labelHash],
  })

  return (state as { latestOwner: Address }).latestOwner
}
