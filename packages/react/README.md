# @ensdomains/ensjs-react

React hooks & utilities to interact with the Ethereum Name Service using ENSjs

## Installation

After installing [wagmi](https://wagmi.sh), simply run

```sh
pnpm install @ensdomains/ensjs-react
```

## Hooks

- `useEnsAvailable` - checks availability (uses [getAvailable](/docs/public/function.getAvailable.md))
- `useEnsExpiry` - returns expiry of a name (uses [getExpiry](/docs/public/function.getExpiry.md))
- `useEnsResolverInterfaces` - check supportsInterface on resolver (uses [getSupportedInterfaces](/docs/public/function.getSupportedInterfaces.md))
- `useNamesForAddress` - lists names from subgraph (uses [getNamesForAddress](/docs/subgraph/function.getNamesForAddress.md))
- `useDecodedName` - decodes name using subgraph (uses [getDecodedName](/docs/subgraph/function.getDecodedName.md))
- `useEnsRecordsWrite` - writes records to a name (uses [setRecords](/docs/wallet/function.setRecords.md)) (wip)
- `useEnsCredentials` - returns credentials from a name (uses [getTextRecord](/docs/public/function.getTextRecord.md)) (lite)
