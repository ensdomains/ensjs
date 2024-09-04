# @ensdomains/ensjs-react

React hooks & utilities to interact with the Ethereum Name Service using ENSjs

## Installation

After installing [wagmi](https://wagmi.sh), simply run

```sh
pnpm install @ensdomains/ensjs-react
```

## Hooks

- `useEnsAvailable` - checks availability (uses [getAvailable](/docs/public/function.getAvailable.md))
- `useEnsResolverInterfaces` - check supportsInterface on resolver (uses [getSupportedInterfaces](/docs/public/function.getSupportedInterfaces.md))
- `useNamesForAddress` - lists names from subgraph (uses [getNamesForAddress](/docs/subgraph/function.getNamesForAddress.md))
- `useDecodedName` - decodes name using subgraph (uses [getDecodedName](/docs/subgraph/function.getDecodedName.md))
