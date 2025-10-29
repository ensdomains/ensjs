import type { Address, Hex } from 'viem'
import type { ChainWithSubgraph } from '../../clients/chain.js'
import { createSubgraphClient } from './client.js'

type SubgraphResult = {
  domains: {
    name: string
    resolver: {
      coinTypes: string[]
    }
  }[]
}

export type GetResolvedNamesForAddressParameters = {
  address: Address
}

export type GetResolvedNamesForAddressReturnType = {
  name: string
  coinTypes: string[]
}[]

export type GetResolvedNamesForAddressErrorType = Error

/**
 * Gets domains from the subgraph that resolve to a given address.
 * @param client - {@link ClientWithEns}
 * @param parameters - {@link GetNamesResolvedToAddressParameters}
 * @returns Name array. {@link GetNamesResolvedToAddressReturnType}
 *
 * @example
 * const result = await getResolvedNamesForAddress(client, { address: '0xD3B282e9880cDcB1142830731cD83f7ac0e1043f' })
 */
export const getResolvedNamesForAddress = async (
  client: { chain: ChainWithSubgraph },
  { address }: GetResolvedNamesForAddressParameters,
) => {
  const subgraphClient = createSubgraphClient(client)

  const query = `
    query ($address: String!) {
      domains(where: { resolvedAddress: $address }) {
        name
        resolver {
          coinTypes
        }
      }
    }
  `

  const result = await subgraphClient.request<
    SubgraphResult,
    GetResolvedNamesForAddressParameters
  >(query, { address: address.toLowerCase() as Hex })

  return result.domains.map((domain) => ({
    name: domain.name,
    coinTypes: domain.resolver?.coinTypes ?? [],
  }))
}
