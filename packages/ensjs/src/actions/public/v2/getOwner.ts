import { permissionedRegistryGetStateSnippet } from '@ensdomains/ensjs-abi/v2/permissionedRegistry'
import { type Address, type Client, labelhash, zeroAddress } from 'viem'
import { type ReadContractErrorType, readContract } from 'viem/actions'
import { getAction } from 'viem/utils'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'

export type GetOwnerParameters = {
  registryAddress: Address
  label: string
}

export type GetOwnerErrorType = ReadContractErrorType

// IPermissionedRegistry.Status (see contracts-v2 `PermissionedRegistry.sol`):
//   AVAILABLE = 0, RESERVED = 1, REGISTERED = 2
// A label is only currently owned when REGISTERED. Once expired the registry
// reports AVAILABLE — but it deliberately keeps `latestOwner` pointing at the
// lapsed holder (used for grace-period renewals / history), so reading that
// field directly would report an expired name as still owned.
const STATUS_REGISTERED = 2

/**
 * Gets the current owner of a name from a V2 registry.
 *
 * Mirrors the registry's `ownerOf`: returns the zero address once the name has
 * expired (or was never registered). The registry retains `latestOwner` after
 * expiry, so we gate on the registration status rather than returning the stale
 * holder — see {@link STATUS_REGISTERED}.
 * @param client - {@link Client}
 * @param parameters - {@link GetOwnerParameters}
 * @returns Owner address, or the zero address if the name has no current owner.
 */
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

  return state.status === STATUS_REGISTERED ? state.latestOwner : zeroAddress
}
