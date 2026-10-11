# @ensdomains/ensjs-abi

## 5.0.2

### Patch Changes

- [#402](https://github.com/ensdomains/ensjs/pull/402) [`1f593c4`](https://github.com/ensdomains/ensjs/commit/1f593c47bcf240976b489c2b11a6adb095a09605) Thanks [@v1rtl](https://github.com/v1rtl)! - Fix `getNames`. It called `resolveNames(address[])`, which the deployed DefaultReverseResolvers don't have; they take `resolveNames(address[], uint8 perPage)`. `defaultReverseResolverResolveNamesSnippet` now matches the deployed signature. Sepolia's `ensDefaultReverseResolver` now points at the official resolver (`0x9DC6…`) instead of a redeploy that returned empty names.

## 5.0.1

No changes in this release.

## 5.0.0

### Major Changes

- [#392](https://github.com/ensdomains/ensjs/pull/392) [`a49bfba`](https://github.com/ensdomains/ensjs/commit/a49bfba18b20c0dfe94c10d919f6ea91cba8b7c8) Thanks [@v1rtl](https://github.com/v1rtl)! - ENSjs v5: ENSv2 support.
  
  - Add support for ENSv2 contracts (permissioned registries and resolvers, roles, migration, registration and renewal) alongside ENSv1
  - Extract contract ABIs and addresses into the new `@ensdomains/ensjs-abi` package
  - Group actions by contract and re-cut entrypoints to match the action groups
  - Replace `graphql-request` with a plain fetch subgraph client
  - Add `@ensdomains/ensjs-query-core` and migrate `@ensdomains/ensjs-react` to the v5 API; all packages are now versioned together
