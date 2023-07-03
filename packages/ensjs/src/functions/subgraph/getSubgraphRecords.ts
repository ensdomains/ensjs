import { gql } from 'graphql-request'
import type { Address } from 'viem'
import { ClientWithEns } from '../../contracts/consts'
import { DateWithValue } from '../../types'
import { namehash } from '../../utils/normalise'
import { createSubgraphClient } from './client'

export type GetSubgraphRecordsParameters = {
  /** Name to get records for */
  name: string
  /** Resolver address to use */
  resolverAddress?: Address
}

export type GetSubgraphRecordsReturnType = {
  /** Name migration status from old ENS registry */
  isMigrated: boolean
  /** Initial name creation time */
  createdAt: DateWithValue<number>
  /** Array of text record keys */
  texts: string[]
  /** Array of coin ids */
  coins: string[]
} | null

const inheritedResolverQuery = gql`
  query getSubgraphRecords($id: String!) {
    domain(id: $id) {
      name
      isMigrated
      createdAt
      resolver {
        texts
        coinTypes
      }
    }
  }
`

const customResolverQuery = gql`
  query getSubgraphRecords($id: String!, $resolverId: String!) {
    domain(id: $id) {
      name
      isMigrated
      createdAt
    }
    resolver(id: $resolverId) {
      texts
      coinTypes
    }
  }
`

type DomainResult = {
  name: string
  isMigrated: boolean
  createdAt: string
}

type ResolverResult = {
  texts: string[]
  coinTypes: string[]
}

type InheritedResolverSubgraphResult = {
  domain?: DomainResult & {
    resolver?: ResolverResult
  }
}

type CustomResolverSubgraphResult = {
  domain?: DomainResult
  resolver?: ResolverResult
}

/**
 * Gets the records for a name from the subgraph
 * @param client - {@link ClientWithEns}
 * @param parameters - {@link GetSubgraphRecordsParameters}
 * @returns Record object, or null if name was not found. {@link GetSubgraphRecordsReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts, getSubgraphRecords } from '@ensdomains/ensjs'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getSubgraphRecords(client, { name: 'ens.eth' })
 * // {
 * //   isMigrated: true,
 * //   createdAt: { date: 2019-08-26T05:09:01.000Z, value: 1566796141000 },
 * //   texts: [ 'snapshot', 'url', 'avatar', 'com.twitter', 'com.github' ],
 * //   coins: [ '60' ]
 * // }
 */
const getSubgraphRecords = async (
  client: ClientWithEns,
  { name, resolverAddress }: GetSubgraphRecordsParameters,
): Promise<GetSubgraphRecordsReturnType> => {
  const subgraphClient = createSubgraphClient({ client })
  const id = namehash(name)

  let domainResult: DomainResult
  let resolverResult: ResolverResult | undefined

  if (resolverAddress) {
    const resolverId = `${resolverAddress.toLowerCase()}-${id}`
    const response = await subgraphClient.request<CustomResolverSubgraphResult>(
      customResolverQuery,
      {
        id,
        resolverId,
      },
    )
    if (!response || !response.domain) return null
    domainResult = response.domain
    resolverResult = response.resolver
  } else {
    const response =
      await subgraphClient.request<InheritedResolverSubgraphResult>(
        inheritedResolverQuery,
        {
          id,
        },
      )
    if (!response || !response.domain) return null
    ;({
      domain: { resolver: resolverResult, ...domainResult },
    } = response)
  }

  const { isMigrated, createdAt: stringCreatedAt } = domainResult
  const intCreatedAt = parseInt(stringCreatedAt) * 1000
  const texts = resolverResult?.texts || []
  const coins = resolverResult?.coinTypes || []

  return {
    isMigrated,
    createdAt: {
      date: new Date(intCreatedAt),
      value: intCreatedAt,
    },
    texts,
    coins,
  }
}

export default getSubgraphRecords
