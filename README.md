# ![ENSjs](https://user-images.githubusercontent.com/11844316/161689061-98ea01ee-b119-40ac-a512-5370eb8b4107.svg)

The ultimate ENS JavaScript library, with [viem](https://github.com/wevm/viem) under the hood.

ENSjs is a TypeScript library for interacting with the Ethereum Name Service. It provides
tree-shakeable, composable actions on top of viem, with first-class support for both
ENS v1 and ENS v2.

## Features

- Composable actions that extend any viem `Client`
- Full tree-shaking — pay only for the actions you import
- Multicall batching for read actions
- TypeScript-first, with strict types for chain contracts
- ENS v1 + ENS v2 support side by side
- Subgraph and DNS helpers included
- Standalone `@ensdomains/ensjs-abi` package for ABI snippets

## Monorepo layout

| Package | Description |
| --- | --- |
| [`@ensdomains/ensjs`](./packages/ensjs) | Main library — actions, clients, utils |
| [`@ensdomains/ensjs-abi`](./packages/ensjs-abi) | ABI snippets for every ENS contract (v1 + v2) |
| [`@ensdomains/ensjs-react`](./packages/react) | React hooks built on `@wagmi/core` |
| [`@ensdomains/ensjs-query-core`](./packages/query-core) | `@wagmi/core` query integration |

Supported chains: `mainnet` (1) and `sepolia` (11155111).

## Installation

```sh
pnpm add @ensdomains/ensjs viem
```

You'll also need `viem` ≥ 2.9.2 as a peer dependency.

## Getting started

`addEnsL1Contracts` extends a viem chain with all ENS contract addresses and subgraph URLs,
so you can use it with any viem `createPublicClient` / `createWalletClient`.

```ts
import { http, createPublicClient } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsL1Contracts } from '@ensdomains/ensjs'
import { getAddressRecord, getRecords } from '@ensdomains/ensjs/public'

const client = createPublicClient({
  chain: addEnsL1Contracts(mainnet),
  transport: http(),
})

const eth = await getAddressRecord(client, { name: 'ens.eth' })
const records = await getRecords(client, {
  name: 'ens.eth',
  texts: ['com.twitter', 'avatar'],
  contentHash: true,
})
```

## Entry points

The `@ensdomains/ensjs` package is split into subpath exports so bundlers can drop
everything you don't import.

| Import | Contents |
| --- | --- |
| `@ensdomains/ensjs` | `addEnsL1Contracts`, error classes |
| `@ensdomains/ensjs/public` | Shared read actions (resolution, records, reverse, price, availability) |
| `@ensdomains/ensjs/public/v1` | v1-specific reads |
| `@ensdomains/ensjs/public/v2` | v2-specific reads |
| `@ensdomains/ensjs/wallet` | Shared write actions (register, renew, set records, wrap, transfer, …) |
| `@ensdomains/ensjs/wallet/v2` | v2-specific writes |
| `@ensdomains/ensjs/subgraph` | Subgraph client + queries (`getSubnames`, `getNamesForAddress`, history, …) |
| `@ensdomains/ensjs/dns` | DNS helpers (`getDnsOwner`, `importDnsName`, `getDnsImportData`, …) |
| `@ensdomains/ensjs/utils` | Coders (`getAddress`, `getText`, `getAbi`, `getContentHash`), name utils |
| `@ensdomains/ensjs/utils/v2` | v2 utils (role encoding, resolver resources, canonical IDs) |
| `@ensdomains/ensjs/contracts` | Re-exports of ABI snippets and `getChainContractAddress` |
| `@ensdomains/ensjs/chain` | Chain types and helpers (`ChainWithEns`, `extendChainWithEns`) |

ABIs themselves are published as a standalone package and can be imported directly:

```ts
import { permissionedRegistryGetStateSnippet } from '@ensdomains/ensjs-abi/v2/permissionedRegistry'
import { ethRegistrarControllerRegisterSnippet } from '@ensdomains/ensjs-abi/v1/ethRegistrarController'
```

## Action pattern

Every action is a plain function that takes the viem `Client` first and parameters second.

```ts
const result = await actionName(client, {
  /* params */
})
```

Read actions use `getAction` + `readContract` / `multicall` so they work with whatever
batching configuration is on the client. Write actions return a transaction hash and accept
the standard viem write parameters (`account`, `chain`, gas, etc.).

## Development

```sh
# Install
pnpm install

# Build everything
pnpm -r build

# Build a single package
pnpm -F @ensdomains/ensjs build
pnpm -F @ensdomains/ensjs-abi build

# Lint (Biome)
pnpm lint

# Test the main package
pnpm -F @ensdomains/ensjs test
pnpm -F @ensdomains/ensjs test:watch
pnpm -F @ensdomains/ensjs test src/actions/public/getRecords.test.ts

# Local test environment with deployed ENS contracts
pnpm -F @ensdomains/ensjs denv

# Just the local anvil node (no contract deployment scripts)
pnpm -F @ensdomains/ensjs anvil

# Generate the markdown docs site
pnpm -F @ensdomains/ensjs generateDocs

# Versioning (changesets)
pnpm chgset:run
pnpm chgset:version
```

Node ≥ 22 is required for the main packages (≥ 18 for `query-core`). Tooling: pnpm 10,
TypeScript strict mode, Biome for formatting and linting, Vitest for tests.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidance on adding new actions, wiring up new
ABI snippets, registering new contract addresses, and the test conventions used across the
repo.

## Docs

Per-action markdown docs live under [`docs/`](./docs). A hosted docs site is in progress.

## License

MIT
