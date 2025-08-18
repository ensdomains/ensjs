# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Install dependencies (from root)
pnpm install

# Build the main package
cd packages/ensjs && pnpm build

# Run tests
cd packages/ensjs && pnpm test

# Run tests in watch mode
cd packages/ensjs && pnpm test:watch

# Run a single test file
cd packages/ensjs && pnpm test path/to/file.test.ts

# Lint/format code (from root or package)
pnpm lint

# Start test environment
cd packages/ensjs && pnpm tenv
```

### Publishing
```bash
# Version packages with changesets
pnpm chgset:version

# Publish packages
pnpm release
```

## Architecture

ENSjs v3 is a monorepo containing the core ENS JavaScript library built on top of viem.

### Client Types
- **EnsPublicClient**: Read operations (getOwner, getResolver, getName, etc.)
- **EnsWalletClient**: Write operations (registerName, transferName, setRecords, etc.)
- **EnsSubgraphClient**: Subgraph queries for historical/aggregate data

### Function Organization
```
src/functions/
├── public/      # Read functions (e.g., getAddressRecord, getTextRecord)
├── wallet/      # Write functions (e.g., setResolver, setRecords)
├── subgraph/    # Subgraph queries (e.g., getNamesForAddress)
└── dns/         # DNS-related functions
```

### Key Patterns
- All functions are designed to be batchable using viem's multicall
- Extensive use of TypeScript generics for type safety
- Custom error types in `/errors/` for detailed error handling
- Utility functions in `/utils/` for common operations like name normalization

### Testing
- Uses Vitest with happy-dom environment
- Test files co-located with source (*.test.ts)
- ENS test environment available via `pnpm tenv` for integration testing
- Tests should not run in parallel due to shared blockchain state

### Code Style
- Biome for linting and formatting (2 spaces, single quotes)
- TypeScript strict mode enabled
- No explicit `any` types (warning)
- No non-null assertions allowed
- Imports are automatically organized