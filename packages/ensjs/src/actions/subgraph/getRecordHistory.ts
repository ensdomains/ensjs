import { gql } from 'graphql-request'
import { namehash } from 'viem'
import type { ChainWithSubgraph } from '../../clients/chain.js'
import { createSubgraphClient } from './client.js'
import type { ResolverEvent } from './events.js'
import type { ReturnResolverEvent } from './getNameHistory.js'
import { decodeResolverEvents } from './utils.js'

type SubgraphResult = {
  domain?: {
    resolver?: {
      events: ResolverEvent[]
    }
  }
}

export type GetRecordHistoryReturnType =
  | ReturnResolverEvent[]
  | null
  | undefined

export type RecordKey = 'name' | 'texts' | 'coins' | 'abi' | 'contentHash'

export type GetRecordHistoryParameters<key extends RecordKey = RecordKey> = {
  name: string
  key: key
}

export type GetRecordHistoryErrorType = Error

const events: Record<RecordKey, ResolverEvent['type'][]> = {
  coins: ['AddrChanged', 'MulticoinAddrChanged'],
  abi: ['AbiChanged'],
  contentHash: ['ContenthashChanged'],
  name: ['NameChanged'],
  texts: ['TextChanged'],
} as const

export const getRecordHistory = async <key extends RecordKey = RecordKey>(
  client: { chain: ChainWithSubgraph },
  { name, key }: GetRecordHistoryParameters<key>,
): Promise<GetRecordHistoryReturnType> => {
  const subgraphClient = createSubgraphClient(client)

  const query = gql`
    query getRecordHistory($id: String!) {
      domain(id: $id) {
        resolver {
          events {
            id
            blockNumber
            transactionID
            type: __typename
            ${
              key === 'name'
                ? `
            ... on NameChanged {
              name
            }
            `
                : ''
            }
            ${
              key === 'texts'
                ? `
            ... on TextChanged {
              key
              value
            }
            `
                : ''
            }
            ${
              key === 'coins'
                ? `
            ... on MulticoinAddrChanged {
              coinType
              multiaddr: addr
            }
            ... on AddrChanged {
              addr {
                id
              }
            }
            `
                : ''
            }
            ${
              key === 'abi'
                ? `
            ... on AbiChanged {
              contentType
            }
            `
                : ''
            }
            ${
              key === 'contentHash'
                ? `
            ... on ContenthashChanged {
              hash
            }
            `
                : ''
            }
          }
        }
      }
    }
  `

  const queryVars = {
    id: namehash(name),
  }

  const result = await subgraphClient.request<SubgraphResult, typeof queryVars>(
    query,
    queryVars,
  )

  return decodeResolverEvents(
    (result.domain?.resolver?.events || []).filter((el) =>
      events[key].includes(el.type),
    ),
  )
}
