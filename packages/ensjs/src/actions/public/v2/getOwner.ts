import { permissionedRegistryGetStateSnippet } from '@ensdomains/ensjs-abi/v2/permissionedRegistry'
import { type Address, type Client, labelhash } from 'viem'
import { type ReadContractErrorType, readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'

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

  const labelHash = BigInt(labelhash(label))

  const state = await readContractAction({
    address: registryAddress,
    abi: permissionedRegistryGetStateSnippet,
    functionName: 'getState',
    args: [labelHash],
  })

  return state.latestOwner
}
