import { dnsRegistrarSuffixesSnippet } from '@ensdomains/ensjs-abi/dnsRegistrar'
import { publicSuffixListIsPublicSuffixSnippet } from '@ensdomains/ensjs-abi/publicSuffixList'
import {
  type Chain,
  type GetChainContractAddressErrorType,
  type ReadContractErrorType,
  toHex,
} from 'viem'
import { readContract } from 'viem/actions'
import { packetToBytes } from 'viem/ens'
import { getAction } from 'viem/utils'
import {
  getChainContractAddress,
  type RequireClientContracts,
} from '../../clients/shared.js'
import { ASSERT_NO_TYPE_ERROR } from '../../types/internal.js'

export type IsDnsPublicSuffixParameters = {
  /** DNS name whose suffix eligibility to check (a TLD like `xyz`, or any suffix) */
  name: string
}

export type IsDnsPublicSuffixReturnType = boolean

export type IsDnsPublicSuffixErrorType =
  | ReadContractErrorType
  | GetChainContractAddressErrorType

/**
 * Checks whether a name is accepted by the DNSRegistrar's onchain
 * `PublicSuffixList` — the claimability gate for `importDnsName()`: a claim
 * under a suffix outside the list reverts `InvalidPublicSuffix`.
 *
 * @param client - {@link Client}
 * @param parameters - {@link IsDnsPublicSuffixParameters}
 * @returns `true` if the suffix is claimable. {@link IsDnsPublicSuffixReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { isDnsPublicSuffix } from '@ensdomains/ensjs/dns'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const claimable = await isDnsPublicSuffix(client, { name: 'xyz' })
 */
export async function isDnsPublicSuffix<chain extends Chain>(
  client: RequireClientContracts<chain, 'ensLegacyDnsRegistrar'>,
  { name }: IsDnsPublicSuffixParameters,
): Promise<IsDnsPublicSuffixReturnType> {
  ASSERT_NO_TYPE_ERROR(client)

  const readContractAction = getAction(client, readContract, 'readContract')

  const suffixListAddress = await readContractAction({
    address: getChainContractAddress({
      chain: client.chain,
      contract: 'ensLegacyDnsRegistrar',
    }),
    abi: dnsRegistrarSuffixesSnippet,
    functionName: 'suffixes',
  })

  return readContractAction({
    address: suffixListAddress,
    abi: publicSuffixListIsPublicSuffixSnippet,
    functionName: 'isPublicSuffix',
    args: [toHex(packetToBytes(name))],
  })
}
