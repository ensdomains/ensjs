/**
 * @module subgraph
 * Subgraph module for querying indexed ENS data from Ethereum L1.
 *
 * This module provides comprehensive functions for interacting with indexed ENS data
 * through The Graph subgraph. It enables efficient querying of name histories,
 * subnames, registrations, and other ENS-related information.
 *
 * Use a custom subgraph URL in production to avoid rate limiting.
 * @see {@link ../docs/basics/custom-subgraph-uris.md | Custom Subgraph URIs Guide}
 */
export { createSubgraphClient } from './functions/subgraph/client.js'
export type {
  AbiChanged,
  AddrChanged,
  AuthorisationChanged,
  BaseDomainEvent,
  BaseRegistrationEvent,
  BaseResolverEvent,
  ContenthashChanged,
  DomainEvent,
  DomainEventKey,
  ExpiryExtended,
  FusesSet,
  InterfaceChanged,
  MulticoinAddrChanged,
  NameChanged,
  NameRegistered,
  NameRenewed,
  NameTransferred,
  NameUnwrapped,
  NameWrapped,
  NewOwner,
  NewResolver,
  NewTtl,
  PubkeyChanged,
  RegistrationEvent,
  RegistrationEventKey,
  ResolverEvent,
  ResolverEventKey,
  TextChanged,
  Transfer,
  VersionChanged,
  WrappedTransfer,
} from './functions/subgraph/events.js'
export {
  default as getDecodedName,
  type GetDecodedNameParameters,
  type GetDecodedNameReturnType,
} from './functions/subgraph/getDecodedName.js'
export {
  default as getNameHistory,
  type GetNameHistoryParameters,
  type GetNameHistoryReturnType,
} from './functions/subgraph/getNameHistory.js'
export {
  default as getNamesForAddress,
  type GetNamesForAddressParameters,
  type GetNamesForAddressReturnType,
  type NameWithRelation,
} from './functions/subgraph/getNamesForAddress.js'
export {
  default as getSubgraphRecords,
  type GetSubgraphRecordsParameters,
  type GetSubgraphRecordsReturnType,
} from './functions/subgraph/getSubgraphRecords.js'
export {
  default as getSubgraphRegistrant,
  type GetSubgraphRegistrantParameters,
  type GetSubgraphRegistrantReturnType,
} from './functions/subgraph/getSubgraphRegistrant.js'
export {
  default as getSubnames,
  type GetSubnamesParameters,
  type GetSubnamesReturnType,
} from './functions/subgraph/getSubnames.js'
export {
  getChecksumAddressOrNull,
  makeNameObject,
  type Name,
} from './functions/subgraph/utils.js'
