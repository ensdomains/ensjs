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

**Actions** (`src/actions/`): Composable functions that extend viem clients
- `public/v1/` - ENS v1 read operations (getExpiry, getOwner, getWrapperData)
- `public/v2/` - ENS v2 read operations (getExpiry, getNameRegistries, getNameRolesForAccount)
- `wallet/v2/` - ENS v2 write operations (deploySubregistry, grantRoles, setSubregistry)
- `dns/` - DNS-related functions
- `subgraph/` - Subgraph query functions

**Clients** (`src/clients/`): Factory functions for L1/L2 chain support
- `l1.ts` - Mainnet client
- `l2.ts` - L2 chain clients
- Supported chains: mainnet (1), sepolia (11155111)

**Contracts** (`src/contracts/`): ABIs and chain-specific addresses for 20+ ENS contracts

**Utils** (`src/utils/`):
- `coders/` - ABI encoding/decoding (getAbi, getAddress, getContentHash, getText)
- `name/` - Name normalization and validation
- `v2/registry/` - V2 registry utilities (labelToCanonicalId)
- `v2/roles/` - Role encoding/decoding

**Exports** (`src/exports/`): Public API surface
- `public.ts` - Public client actions
- `wallet.ts` - Wallet client actions
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
- `graphql-request` - Subgraph queries
