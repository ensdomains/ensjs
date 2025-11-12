import { gql } from 'graphql-request'
import { namehash } from 'viem/ens'
import type { ChainWithSubgraph } from '../../clients/chain.js'
import { createSubgraphClient } from './client.js'
import type {
  BaseResolverEvent,
  ContenthashChanged,
  DomainEvent,
  MulticoinAddrChanged,
  RegistrationEvent,
  ResolverEvent,
} from './events.js'
import { decodeResolverEvents } from './utils.js'

export type GetNameHistoryParameters = {
  /** Name to get history for */
  name: string
  /** Only fetch the first n events */
  first?: number
  /** Order direction */
  orderDirection?: 'asc' | 'desc'
}

export type GetNameHistoryReturnType = {
  /** Array of domain events */
  domainEvents: ReturnDomainEvent[]
  /** Array of registration events */
  registrationEvents: ReturnRegistrationEvent[] | null
  /** Array of resolver events */
  resolverEvents: ReturnResolverEvent[] | null
} | null

export type GetNameHistoryErrorType = Error

type SubgraphResult = {
  domain?: {
    events: DomainEvent[]
    registration?: {
      events: RegistrationEvent[]
    }
    resolver?: {
      events: ResolverEvent[]
    }
  }
}

type FlattenedEvent<TEvent extends {}> = {
  [K in keyof TEvent]: TEvent[K] extends { id: string } ? string : TEvent[K]
}

type ReturnDomainEvent = FlattenedEvent<DomainEvent>
type ReturnRegistrationEvent = FlattenedEvent<RegistrationEvent>
export type ReturnResolverEvent = FlattenedEvent<
  | Exclude<ResolverEvent, MulticoinAddrChanged | ContenthashChanged>
  | (BaseResolverEvent & {
      type: 'MulticoinAddrChanged'
      coinType: string
      coinName: string | null
      decoded: boolean
      addr: string | null
    })
  | (BaseResolverEvent & {
      type: 'ContenthashChanged'
      decoded: boolean
      contentHash: string | null
      protocolType: string | null
    })
>

/**
 * Gets the history of a name from the subgraph.
 * @param client - {@link ClientWithEns}
 * @param parameters - {@link GetNameHistoryParameters}
 * @returns History object, or null if name could not be found. {@link GetNameHistoryReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts } from '@ensdomains/ensjs'
 * import { getNameHistory } from '@ensdomains/ensjs/subgraph'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getNameHistory(client, { name: 'ens.eth' })
 */
const getNameHistory = async (
  client: { chain: ChainWithSubgraph },
  { name, first, orderDirection }: GetNameHistoryParameters,
): Promise<GetNameHistoryReturnType> => {
  const subgraphClient = createSubgraphClient(client)

  const query = gql`
    query getNameHistory($id: String!, $first: Int, $orderDirection: OrderDirection) {
      domain(id: $id) {
        events(first: $first, orderDirection: $orderDirection) {
          id
          blockNumber
          transactionID
          type: __typename
          ... on Transfer {
            owner {
              id
            }
          }
          ... on NewOwner {
            owner {
              id
            }
          }
          ... on NewResolver {
            resolver {
              id
            }
          }
          ... on NewTTL {
            ttl
          }
          ... on WrappedTransfer {
            owner {
              id
            }
          }
          ... on NameWrapped {
            fuses
            expiryDate
            owner {
              id
            }
          }
          ... on NameUnwrapped {
            owner {
              id
            }
          }
          ... on FusesSet {
            fuses
          }
          ... on ExpiryExtended {
            expiryDate
          }
        }
        registration {
          events(first: $first, orderDirection: $orderDirection) {
            id
            blockNumber
            transactionID
            type: __typename
            ... on NameRegistered {
              registrant {
                id
              }
              expiryDate
            }
            ... on NameRenewed {
              expiryDate
            }
            ... on NameTransferred {
              newOwner {
                id
              }
            }
          }
        }
        resolver {
          events(first: $first, orderDirection: $orderDirection) {
            id
            blockNumber
            transactionID
            type: __typename
            ... on AddrChanged {
              addr {
                id
              }
            }
            ... on MulticoinAddrChanged {
              coinType
              multiaddr: addr
            }
            ... on NameChanged {
              name
            }
            ... on AbiChanged {
              contentType
            }
            ... on PubkeyChanged {
              x
              y
            }
            ... on TextChanged {
              key
              value
            }
            ... on ContenthashChanged {
              hash
            }
            ... on InterfaceChanged {
              interfaceID
              implementer
            }
            ... on AuthorisationChanged {
              owner
              target
              isAuthorized
            }
            ... on VersionChanged {
              version
            }
          }
        }
      }
    }
  `

  const queryVars = {
    id: namehash(name),
    first,
    orderDirection,
  }

  const result = await subgraphClient.request<SubgraphResult, typeof queryVars>(
    query,
    queryVars,
  )

  if (!result.domain) return null

  const domainEvents = result.domain.events.map(
    (event: DomainEvent): ReturnDomainEvent => {
      switch (event.type) {
        case 'NewResolver': {
          return {
            ...event,
            resolver: event.resolver.id.split('-')[0],
          }
        }
        case 'NewOwner':
        case 'Transfer':
        case 'WrappedTransfer':
        case 'NameWrapped':
        case 'NameUnwrapped': {
          return {
            ...event,
            owner: event.owner.id,
          }
        }
        default:
          return event
      }
    },
  )

  const registrationEvents = result.domain?.registration?.events.map(
    (event: RegistrationEvent): ReturnRegistrationEvent => {
      switch (event.type) {
        case 'NameRegistered': {
          return {
            ...event,
            registrant: event.registrant.id,
          }
        }
        case 'NameTransferred': {
          return {
            ...event,
            newOwner: event.newOwner.id,
          }
        }
        default:
          return event
      }
    },
  )

  const resolverEvents = decodeResolverEvents(
    result.domain?.resolver?.events || [],
  )

  return {
    domainEvents,
    registrationEvents: registrationEvents || null,
    resolverEvents: resolverEvents || null,
  }
}

export default getNameHistory
