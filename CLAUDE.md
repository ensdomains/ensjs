# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ENSjs is the ultimate ENS JavaScript library for interacting with the Ethereum Name Service. It's built on top of viem and provides comprehensive functionality for ENS operations.

## Development Commands

### Setup and Installation
```bash
# Install dependencies (uses pnpm)
pnpm install
```

### Development Environment
```bash
# Start test environment with ENS contracts
pnpm tenv start

# Start development environment with extra time
pnpm denv

# Start Anvil without ENS node
pnpm anvil
```

### Testing
```bash
# Run all tests (no file parallelism)
pnpm test

# Watch mode for tests
pnpm test:watch

# Run specific test file
pnpm vitest src/functions/public/getOwner.test.ts
```

### Build and Lint
```bash
# Build the project
pnpm build

# Run linter (using Biome)
pnpm lint

# Clean build artifacts
pnpm clean
```

### Package Management
```bash
# Version management
pnpm ver

# Changeset commands
pnpm chgset:run
pnpm chgset:version
pnpm chgset:version:prerelease

# Local publishing for testing
pnpm publish:local:ensjs
pnpm publish:local:ens-test-env
```

## Architecture

### Monorepo Structure
- `packages/ensjs` - Main ENS library
- `packages/react` - React hooks for ENS
- `packages/ens-test-env` - Testing environment
- `packages/query-core` - Query functionality

### Client Types

ENSjs provides three specialized clients:

1. **Public Client** - Read-only blockchain operations
   - Location: `src/clients/public.ts`
   - Usage: `createEnsPublicClient({ chain, transport })`

2. **Wallet Client** - Write operations requiring signer
   - Location: `src/clients/wallet.ts`
   - Usage: `createEnsWalletClient({ chain, transport, account })`

3. **Subgraph Client** - Query ENS subgraph
   - Location: `src/clients/subgraph.ts`
   - Usage: Part of public client or standalone

### Code Organization

```
src/
├── clients/         # Client implementations
├── contracts/       # Contract definitions & addresses
├── functions/       # Core functionality
│   ├── public/     # Read operations
│   ├── wallet/     # Write operations
│   ├── subgraph/   # Subgraph queries
│   └── dns/        # DNS operations
├── utils/          # Utilities and helpers
└── errors/         # Error definitions
```

### Key Contracts

Contracts are defined in `src/contracts/consts.ts` for:
- Mainnet (chain ID: 1)
- Sepolia (chain ID: 11155111)
- Holesky (chain ID: 17000)

Main contracts:
- `ensRegistry` - Core ENS registry
- `ensPublicResolver` - Standard resolver
- `ensNameWrapper` - Name wrapper functionality
- `ensEthRegistrarController` - Name registration
- `ensUniversalResolver` - Batch operations

### Testing Patterns

- Tests use Vitest framework
- Test files are colocated with source (`.test.ts`)
- Uses `ens-test-env` for contract deployment
- No file parallelism to avoid conflicts

### Import Patterns

```typescript
// Main client
import { createEnsPublicClient } from '@ensdomains/ensjs'

// Specific modules
import { getOwner } from '@ensdomains/ensjs/public'
import { registerName } from '@ensdomains/ensjs/wallet'
import { getNamesForAddress } from '@ensdomains/ensjs/subgraph'
```

## Important Notes

- Always ensure tests pass before committing changes
- The library uses ESM modules (type: "module")
- Minimum Node.js version: 22
- Built with TypeScript for full type safety
- Supports tree-shaking for optimal bundle size
- Uses viem as the underlying Ethereum library

## CI/CD Guidelines

### Fixing CI Failures

When asked to fix CI issues:

1. **Always wait for CI to complete** - Don't assume the task is done after pushing fixes. Wait for all CI checks to finish running.

2. **Verify actual success** - Check that all CI checks (lint, tests, build) actually pass. Use:
   ```bash
   gh pr checks <PR_NUMBER> --repo ensdomains/ensjs --watch
   ```

3. **Iterative fixing** - If CI fails after your fix:
   - Check the specific error messages
   - Fix the issues
   - Push the changes
   - **Wait for CI to run again**
   - Repeat until all checks pass

4. **Common CI checks to monitor**:
   - Lint (code style and formatting)
   - Test (unit and integration tests)
   - Build (TypeScript compilation)
   - SonarCloud (code quality)

5. **Never declare CI fixed until you see green checks** - The task is only complete when all CI checks show as passing on GitHub.