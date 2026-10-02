# @ensdomains/ensjs-query-core

## 5.0.1

### Patch Changes

- Updated dependencies [[`583768f`](https://github.com/ensdomains/ensjs/commit/583768f1fb9d3acab8b19412358955dc13c17686), [`0cb1a0b`](https://github.com/ensdomains/ensjs/commit/0cb1a0b239a72f5930cc1927d8b063a1dfa7dc11), [`890c439`](https://github.com/ensdomains/ensjs/commit/890c4396dc9a24dbc63a25d9d45f00f1c28a3cf9), [`b634a3e`](https://github.com/ensdomains/ensjs/commit/b634a3e5b7de820df30a4cde5e27a1f58060e371), [`f153465`](https://github.com/ensdomains/ensjs/commit/f153465effa88e5221d8177b982143938fee6ba7), [`9575b44`](https://github.com/ensdomains/ensjs/commit/9575b440c4a1b46f17879bd7cef6798e648db396)]:
  - @ensdomains/ensjs@5.0.1

## 5.0.0

### Major Changes

- [#392](https://github.com/ensdomains/ensjs/pull/392) [`a49bfba`](https://github.com/ensdomains/ensjs/commit/a49bfba18b20c0dfe94c10d919f6ea91cba8b7c8) Thanks [@v1rtl](https://github.com/v1rtl)! - ENSjs v5: ENSv2 support.
  
  - Add support for ENSv2 contracts (permissioned registries and resolvers, roles, migration, registration and renewal) alongside ENSv1
  - Extract contract ABIs and addresses into the new `@ensdomains/ensjs-abi` package
  - Group actions by contract and re-cut entrypoints to match the action groups
  - Replace `graphql-request` with a plain fetch subgraph client
  - Add `@ensdomains/ensjs-query-core` and migrate `@ensdomains/ensjs-react` to the v5 API; all packages are now versioned together

### Patch Changes

- Updated dependencies [[`a49bfba`](https://github.com/ensdomains/ensjs/commit/a49bfba18b20c0dfe94c10d919f6ea91cba8b7c8)]:
  - @ensdomains/ensjs@5.0.0
