import { getCoderByCoinType } from '@ensdomains/address-encoder'
import { gql } from 'graphql-request'
import { hexToBytes, namehash, trim } from 'viem'
import type { ChainWithSubgraph } from '../../clients/chain.js'
import { decodeContentHash } from '../../utils/contentHash.js'
import { createSubgraphClient } from './client.js'
import type { ResolverEvent } from './events.js'
import type { ReturnResolverEvent } from './getNameHistory.js'

type SubgraphResult = {
  domain?: {
    resolver?: {
      events: ResolverEvent[]
    }
  }
}

export type GetRecordHistoryReturnType = {
  resolverEvents: ReturnResolverEvent[] | null
} | null

export const getRecordHistory = async <
  RecordKey extends 'name' | 'texts' | 'coins' | 'abi' | 'contentHash',
>(
  client: { chain: ChainWithSubgraph },
  { name, key }: { name: string; key: RecordKey },
) => {
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

  // Filter out null events and return only the relevant ones
  return result.domain?.resolver?.events.map(
    (event: ResolverEvent): ReturnResolverEvent => {
      switch (event.type) {
        case 'AddrChanged': {
          return {
            ...event,
            addr: event.addr.id,
          }
        }
        case 'MulticoinAddrChanged': {
          const { multiaddr, ...event_ } = event
          const format = getCoderByCoinType(Number.parseInt(event.coinType))
          if (!format) {
            return {
              ...event_,
              coinName: null,
              decoded: false,
              addr: multiaddr,
            }
          }
          if (multiaddr === '0x' || trim(multiaddr) === '0x00') {
            return {
              ...event_,
              coinName: format.name,
              decoded: true,
              addr: null,
            }
          }
          return {
            ...event_,
            coinName: format.name,
            decoded: true,
            addr: format.encode(hexToBytes(multiaddr)),
          }
        }
        case 'ContenthashChanged': {
          const { decoded: contentHash, protocolType } = decodeContentHash(
            event.hash,
          ) || { protocolType: null, decoded: null }
          return {
            ...event,
            decoded: contentHash !== null,
            contentHash,
            protocolType,
          }
        }
        default:
          return event
      }
    },
  )
}
