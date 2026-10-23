# @ensdomains/ensjs-react

React hooks & utilities to interact with the Ethereum Name Service using ENSjs

## Installation

After installing [wagmi](https://wagmi.sh), simply run

```sh
pnpm install @ensdomains/ensjs-react @ensdomains/ensjs
```

## Hooks

- `useEnsAvailable` - checks availability (uses [getAvailable](/docs/public/v1/functions/getAvailable.md))
- `useEnsExpiry` - returns expiry of a name (uses [getExpiry](/docs/public/v1/functions/getExpiry.md))
- `useEnsResolverInterfaces` - check supportsInterface on resolver (uses [getSupportedInterfaces](/docs/public/functions/getSupportedInterfaces.md))
- `useEnsNamesForAddress` - lists names from subgraph (uses [getNamesForAddress](/docs/subgraph/functions/getNamesForAddress.md))
- `useDecodedName` - decodes name using subgraph (uses [getDecodedName](/docs/subgraph/functions/getDecodedName.md))
- `useWriteEnsRecords` - writes records to a name (uses [setRecords](/docs/wallet/v1/functions/setRecords.md)) (wip)
- `useEnsCredentials` - returns credentials from a name (uses [getCredentials](/docs/public/functions/getCredentials.md)) (lite)
- `useEnsAbi` - returns the ABI record of a name (uses [getAbiRecord](/docs/public/functions/getAbiRecord.md))
- `useEnsAddress` - returns an address record of a name (uses [getAddressRecord](/docs/public/functions/getAddressRecord.md))
- `useEnsContentHash` - returns the content hash record of a name (uses [getContentHashRecord](/docs/public/functions/getContentHashRecord.md))
- `useEnsOwner` - returns the owner of a name (uses [getOwner](/docs/public/v1/functions/getOwner.md))
- `useEnsPrice` - returns the price to register or renew a name (uses [getPrice](/docs/public/v1/functions/getPrice.md))
- `useEnsRecords` - returns several records of a name in one call (uses [getRecords](/docs/public/functions/getRecords.md))
