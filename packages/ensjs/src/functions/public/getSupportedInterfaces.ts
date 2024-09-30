import { type Address, type Client, type Hex, type Transport } from 'viem'
import { multicall } from 'viem/actions'
import { getAction } from 'viem/utils'
import type { ChainWithContract } from '../../contracts/consts.js'
import { erc165SupportsInterfaceSnippet } from '../../contracts/erc165.js'

export type GetSupportedInterfacesParameters<
  interfaces extends readonly Hex[],
> = {
  address: Address
  interfaces: interfaces
}

export type GetSupportedInterfacesReturnType<
  interfaces extends readonly Hex[],
> = {
  -readonly [K in keyof interfaces]: boolean
}

export type GetSupportedInterfacesErrorType = Error

/**
 * Gets the supported interfaces for any contract address.
 * @param client - {@link Client}
 * @param parameters - {@link GetSupportedInterfacesParameters}
 * @returns Array of booleans matching the input array {@link GetSupportedInterfacesReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getSupportedInterfaces } from '@ensdomains/ensjs/public'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getSupportedInterfaces(client, {
 *   address: '0x58774Bb8acD458A640aF0B88238369A167546ef2',
 *   interfaces: ['0x2f435428', '0x23b872dd'],
 * })
 * // [true, false]
 */
export async function getSupportedInterfaces<
  chain extends ChainWithContract<'multicall3'>,
  const interfaces extends readonly Hex[],
>(
  client: Client<Transport, chain>,
  { address, interfaces }: GetSupportedInterfacesParameters<interfaces>,
): Promise<GetSupportedInterfacesReturnType<interfaces>> {
  const multicallAction = getAction(client, multicall, 'multicall')

  const result = await multicallAction({
    contracts: interfaces.map((interfaceId) => ({
      address,
      abi: erc165SupportsInterfaceSnippet,
      functionName: 'supportsInterface',
      args: [interfaceId],
    })),
  })

  return result.map(
    (r) => r.status === 'success' && r.result === true,
  ) as GetSupportedInterfacesReturnType<interfaces>
}
