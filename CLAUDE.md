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

# Auto-fix linting issues
pnpm biome check --write

# Clean build artifacts
pnpm clean
```

#### Linting with Biome

This project uses **Biome** (not ESLint) for linting and formatting.

**Suppression Directives:**
- Line-level ignore: `// biome-ignore lint/rule-name: reason`
- Multiple rules: `// biome-ignore lint/rule1 lint/rule2: reason`
- **Note**: Biome does NOT support file-level `biome-ignore-all` directives. Use line-level comments only.

**Common Rules:**
- `lint/suspicious/noExplicitAny` - Avoid using `any` type
- `lint/complexity/noBannedTypes` - Avoid using `{}` as a type

**File Exclusion:**
- To exclude entire files/directories from linting, add them to `files.ignore` array in `biome.json`
- Example: `packages/react` is excluded from linting

**Important for Claude Code:**
When encountering Biome linter errors or suppression issues:
1. **Always use WebSearch** to look up the correct Biome syntax before suggesting alternatives
2. Check Biome documentation at https://biomejs.dev for the latest directives
3. Do not assume ESLint syntax will work with Biome
4. Remember: `biome-ignore-all` does NOT exist - only use line-level `biome-ignore`

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