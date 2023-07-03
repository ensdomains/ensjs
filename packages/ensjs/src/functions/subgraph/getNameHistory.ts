import { formatsByCoinType } from '@ensdomains/address-encoder'
import { gql } from 'graphql-request'
import { ClientWithEns } from '../../contracts/consts'
import { decodeContenthash } from '../../utils/contentHash'
import { namehash } from '../../utils/normalise'
import { createSubgraphClient } from './client'
import {
  BaseResolverEvent,
  ContenthashChanged,
  DomainEvent,
  MulticoinAddrChanged,
  RegistrationEvent,
  ResolverEvent,
} from './events'

export type GetNameHistoryParameters = {
  /** Name to get history for */
  name: string
}

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
type ReturnResolverEvent = FlattenedEvent<
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

export type GetNameHistoryReturnType = {
  /** Array of domain events */
  domainEvents: ReturnDomainEvent[]
  /** Array of registration events */
  registrationEvents: ReturnRegistrationEvent[] | null
  /** Array of resolver events */
  resolverEvents: ReturnResolverEvent[] | null
} | null

/**
 * Gets the history of a name from the subgraph.
 * @param client - {@link ClientWithEns}
 * @param parameters - {@link GetNameHistoryParameters}
 * @returns History object, or null if name could not be found. {@link GetNameHistoryReturnType}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { addEnsContracts, getNameHistory } from '@ensdomains/ensjs'
 *
 * const client = createPublicClient({
 *   chain: addEnsContracts(mainnet),
 *   transport: http(),
 * })
 * const result = await getNameHistory(client, { name: 'ens.eth' })
 */
const getNameHistory = async (
  client: ClientWithEns,
  { name }: GetNameHistoryParameters,
): Promise<GetNameHistoryReturnType> => {
  const subgraphClient = createSubgraphClient({ client })

  const query = gql`
    query getNameHistory($id: String!) {
      domain(id: $id) {
        events {
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
          events {
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
          events {
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

  const resolverEvents = result.domain?.resolver?.events.map(
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
          const format = formatsByCoinType[parseInt(event.coinType)]
          if (!format) {
            return {
              ...event_,
              coinName: null,
              decoded: false,
              addr: multiaddr,
            }
          }
          if (BigInt(multiaddr) === 0n) {
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
            addr: format.encoder(Buffer.from(multiaddr.slice(2), 'hex')),
          }
        }
        case 'ContenthashChanged': {
          const { decoded: contentHash, protocolType } = decodeContenthash(
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

  return {
    domainEvents,
    registrationEvents: registrationEvents || null,
    resolverEvents: resolverEvents || null,
  }
}

export default getNameHistory
