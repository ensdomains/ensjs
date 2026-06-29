import { universalResolverV2FindParentRegistrySnippet } from '@ensdomains/ensjs-abi/universalResolver'
import { ethRegistrarAvailableSnippet } from '@ensdomains/ensjs-abi/v2/ethRegistrar'
import { permissionedRegistryGetStatusSnippet } from '@ensdomains/ensjs-abi/v2/permissionedRegistry'
import type {
  Chain,
  GetChainContractAddressErrorType,
  ReadContractErrorType,
} from 'viem'
import { labelhash, toHex, zeroAddress } from 'viem'
import { readContract } from 'viem/actions'
import { packetToBytes } from 'viem/ens'
import { getAction } from 'viem/utils'
import type { RequireClientContracts } from '../../../clients/shared.js'
import { getChainContractAddress } from '../../../clients/shared.js'
import { UnsupportedNameTypeError } from '../../../errors/general.js'
import type { ErrorType } from '../../../errors/utils.js'
import { ASSERT_NO_TYPE_ERROR } from '../../../types/internal.js'
import { getNameType } from '../../../utils/name/getNameType.js'

/**
 * TEMPORARY: hardcoded Universal Resolver V2 addresses used solely for the
 * `findParentRegistry` traversal in the eth-subname availability path.
 *
 * Why this is needed (the URv1 / URv2 / proxy situation):
 * - The chain config's `ensUniversalResolver` is intentionally pointed at a UR
 *   that can RESOLVE both v1 and v2 names (records, addr, text, etc.). On
 *   sepolia that is the unified UniversalResolverV2 `0x2f8a…`; on the local
 *   devnet image it is the legacy `UniversalResolver` (`0x4b6a…`), which bridges
 *   to v2 for resolution but predates the v2-only registry-traversal methods.
 * - `findParentRegistry` is a UniversalResolverV2-only method. The devnet's
 *   legacy `UniversalResolver` does NOT implement it (it reverts), and the
 *   devnet's `UpgradableUniversalResolverProxy` DOES implement it but cannot
 *   resolve unmigrated v1 names. No single devnet UR currently satisfies both
 *   needs, so we can't use one shared `ensUniversalResolver` binding for both
 *   resolution and traversal on that image.
 * - On sepolia the same address (`0x2f8a…`) happens to do both, so this map
 *   simply mirrors the config value there.
 *
 * Once the devnet image ships a unified UniversalResolverV2 that resolves v1
 * names AND exposes `findParentRegistry` (matching sepolia's `0x2f8a…`), delete
 * this map and read the address from `getChainContractAddress({ contract:
 * 'ensUniversalResolver' })` again (or introduce a dedicated
 * `ensUniversalResolverV2` contract key).
 */
const TEMP_UNIVERSAL_RESOLVER_V2_BY_CHAIN_ID: Record<number, `0x${string}`> = {
  // sepolia: unified UniversalResolverV2 (resolves v1+v2 AND has findParentRegistry)
  11155111: '0x2f8a180604c42457cb56c7c4f708748ff1f91df1',
  // local devnet: UpgradableUniversalResolverProxy (has findParentRegistry)
  31337: '0x4C2F7092C2aE51D986bEFEe378e50BD4dB99C901',
}

export type GetAvailableParameters = {
  /**
   * Name to check availability for. Only `.eth` names are supported:
   * - `eth-2ld` names (e.g. `name.eth`)
   * - `eth-subname` names of any depth (e.g. `sub.name.eth`)
   *
   * DNS names are not supported (they have both on-chain and off-chain
   * import paths, so a single availability answer would be ambiguous).
   */
  name: string
}

export type GetAvailableReturnType = boolean

export type GetAvailableErrorType =
  | UnsupportedNameTypeError
  | ReadContractErrorType
  | GetChainContractAddressErrorType
  | ErrorType

/**
 * Gets the availability of a `.eth` name to register.
 *
 * For `eth-2ld` names, availability is read from the `.eth` registrar via
 * `isAvailable`, which accounts for grace periods and premium decay.
 *
 * For `eth-subname` names, the Universal Resolver V2's `findParentRegistry`
 * is used to traverse the registry tree and locate the parent registry, then
 * the leaf label's status is checked against it.
 *
 * @param client - {@link Client}
 * @param parameters - {@link GetAvailableParameters}
 * @returns Availability as boolean. {@link GetAvailableReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getAvailable } from '@ensdomains/ensjs/public/v2'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 *
 * // eth-2ld via the .eth registrar
 * const a = await getAvailable(client, { name: 'ens.eth' })
 * // false
 *
 * // eth-subname with auto-traversal via Universal Resolver
 * const b = await getAvailable(client, { name: 'sub.ens.eth' })
 */
export async function getAvailable<chain extends Chain>(
  client: RequireClientContracts<
    chain,
    'ensEthRegistrar' | 'ensUniversalResolver'
  >,
  { name }: GetAvailableParameters,
): Promise<GetAvailableReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const labels = name.split('.')
  const nameType = getNameType(name)

  if (nameType !== 'eth-2ld' && nameType !== 'eth-subname')
    throw new UnsupportedNameTypeError({
      nameType,
      supportedNameTypes: ['eth-2ld', 'eth-subname'],
      details:
        'Only .eth 2LD and subname names can be checked for availability',
    })

  const readContractAction = getAction(client, readContract, 'readContract')
  const leafLabel = labels[0]

  // eth-2ld: availability comes from the .eth registrar (rent/premium aware).
  if (nameType === 'eth-2ld') {
    return readContractAction({
      address: getChainContractAddress({
        chain: client.chain,
        contract: 'ensEthRegistrar',
      }),
      abi: ethRegistrarAvailableSnippet,
      functionName: 'isAvailable',
      args: [leafLabel],
    })
  }

  // eth-subname: use URv2 to find the parent registry, then check the leaf
  // label's status. A missing parent registry means the name is available.
  //
  // TEMPORARY: `findParentRegistry` is a UniversalResolverV2-only method, but
  // the configured `ensUniversalResolver` is not always a URv2 that exposes it
  // (see TEMP_UNIVERSAL_RESOLVER_V2_BY_CHAIN_ID above). Fall back to the chain
  // config when no temporary override is registered for this chain.
  const universalResolverV2Address =
    TEMP_UNIVERSAL_RESOLVER_V2_BY_CHAIN_ID[client.chain.id] ??
    getChainContractAddress({
      chain: client.chain,
      contract: 'ensUniversalResolver',
    })
  const parentRegistry = await readContractAction({
    address: universalResolverV2Address,
    abi: universalResolverV2FindParentRegistrySnippet,
    functionName: 'findParentRegistry',
    args: [toHex(packetToBytes(name))],
  })
  if (parentRegistry === zeroAddress) return true

  const status = await readContractAction({
    address: parentRegistry,
    abi: permissionedRegistryGetStatusSnippet,
    functionName: 'getStatus',
    args: [BigInt(labelhash(leafLabel))],
  })
  return status === 0
}
