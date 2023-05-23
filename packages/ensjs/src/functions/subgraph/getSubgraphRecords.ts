import { gql } from 'graphql-request'
import type { Address } from 'viem'
import { ClientWithEns } from '../../contracts/addContracts'
import { DateWithValue } from '../../types'
import { namehash } from '../../utils/normalise'
import { createSubgraphClient } from './client'

export type GetSubgraphRecordsParameters = {
  name: string
  resolverAddress?: Address
}

export type GetSubgraphRecordsReturnType = {
  isMigrated: boolean
  createdAt: DateWithValue<number>
  texts: string[]
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
