# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ENSjs is a TypeScript library for interacting with the Ethereum Name Service (ENS). It's built on top of Viem and provides comprehensive ENS contract interaction with tree-shaking support.

## Build & Development Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm -r build

# Build specific package
pnpm -F @ensdomains/ensjs build

# Lint all packages
pnpm lint

# Run tests (ensjs package)
pnpm -F @ensdomains/ensjs test

# Watch mode testing
pnpm -F @ensdomains/ensjs test:watch

# Run a single test file
pnpm -F @ensdomains/ensjs test src/actions/public/getRecords.test.ts

# Start test environment (with ENS contracts)
pnpm -F @ensdomains/ensjs denv

# Start local anvil only (no ENSnode, no scripts)
pnpm -F @ensdomains/ensjs anvil

# Generate documentation
pnpm -F @ensdomains/ensjs generateDocs

# Versioning with changesets
pnpm chgset:run    # Create changeset
pnpm chgset:version  # Update versions
```

## Monorepo Structure

```
packages/
├── ensjs/       # Main ENS library (@ensdomains/ensjs)
├── react/       # React hooks (@ensdomains/ensjs-react)
└── query-core/  # @wagmi/core integration (@ensdomains/ensjs-query-core)
```

## Architecture

### Package: @ensdomains/ensjs

**Actions** (`src/actions/`): Composable functions that extend viem clients, grouped
**client kind → protocol version → contract**:

- `public/` and `wallet/` mirror the viem client an action extends; `dns/` and `subgraph/`
  are separate transports.
- Inside each, a contract group that is version-agnostic sits at the top level
  (`resolver/`, `registrar/`, `erc165/`); anything version-specific sits under `v1/` or `v2/`.
  Not being in a version folder means *shared*, never "unsorted".
- Contract groups are named after the contract repos' own directories —
  `contracts-v2/contracts/src/` for v2, `lib/ens-contracts/contracts/` for v1 — not after
  the `@ensdomains/ensjs-abi` module, whose paths do not track versions reliably
  (`v1/publicResolver` holds the standard profile every resolver implements; the root
  `universalResolver` holds v2-only methods; `v2/userRegistry` re-declares methods that
  `PermissionedRegistry` owns).
- File by the **subject** of the operation, not the contract count. Actions taking a
  caller-supplied custodian (`contract: 'registry' | 'nameWrapper'`,
  `contract: 'ensEthRegistrar' | 'ensEthRenewerV1'`) belong to the subject's group — the
  discriminator picks where the record lives, not what the action is about.
- `registrar/` is unprefixed on purpose: the v2 `.eth` registrar is the only one that will
  exist, `renewName` already spans both via its discriminator, and every registration
  action asserts `nameType === 'eth-2ld'`, so no `eth` in the name either.

**Clients** (`src/clients/`): Factory functions for L1/L2 chain support
- `l1.ts` - Mainnet client
- `l2.ts` - L2 chain clients
- Supported chains: mainnet (1), sepolia (11155111)

**Contracts** (`src/contracts/`): ABIs and chain-specific addresses for 20+ ENS contracts

**Utils** (`src/utils/`): same grouping rule as actions
- `resolver/` - standard resolver profile coders (getAbi, getAddress, getContentHash, getText, set*)
- `registrar/` - registration parameter helpers
- `name/` - Name normalization and validation
- `v1/nameWrapper/` - fuses and wrapper state; `v1/resolver/` - PublicResolver clearRecords/multicall
- `v2/registry/` - V2 registry utilities (labelToCanonicalId)
- `v2/roles/` - Role encoding/decoding

**Exports** (`src/exports/`): Public API surface. Each barrel maps 1:1 onto the action
folder it covers, so adding an action means adding one line to exactly one barrel:
- `public.ts` / `wallet.ts` - version-agnostic actions only (`resolver/`, `registrar/`, `erc165/`)
- `public/v1.ts` / `wallet/v1.ts` - everything under `actions/*/v1/`
- `public/v2.ts` / `wallet/v2.ts` - everything under `actions/*/v2/`
- `chain.ts` - Chain configurations

### Action Pattern

Actions follow this structure:
```typescript
export const actionName = async (
  client: SupportedClient,
  params: ActionParams
): Promise<ActionReturn> => {
  // Uses viem's getAction() and multicall for batching
}
```

### Client Types

- **Public Client**: Read-only operations
- **Wallet Client**: Write operations (registration, renewals, records)

## Testing

- Framework: Vitest
- Tests collocated with source: `*.test.ts`
- Test setup: `packages/ensjs/src/test/setup.ts`
- Uses `ens-test-env` for integration tests with deployed contracts

## Code Quality

- Formatter/Linter: Biome
- TypeScript: Strict mode enabled
- Node version: >=22 (main packages), >=18 (query-core)

## Key Dependencies

- `viem` (peer dependency ^2.30.6) - Ethereum interactions
- `@adraffy/ens-normalize` - Name normalization
- `@ensdomains/address-encoder` - Address encoding
- `@ensdomains/content-hash` - Content hash encoding
- `graphql` (optional peer dependency `^16.0.0 || ^17.0.0`) - Parsing/printing subgraph queries; only needed by the `/subgraph` entrypoint, whose client is otherwise plain `fetch`
