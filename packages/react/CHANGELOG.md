# @ensdomains/ensjs-react

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

## 0.0.9

### Patch Changes

- Updated dependencies [[`477befd`](https://github.com/ensdomains/ensjs/commit/477befdc26104501880219ca5028b333e3cf7886)]:
  - @ensdomains/ensjs@4.3.1

## 0.0.8

### Patch Changes

- Updated dependencies [[`5248ffa`](https://github.com/ensdomains/ensjs/commit/5248ffa82f000050a5f703eefc8a93c836b8c151)]:
  - @ensdomains/ensjs@4.3.0

## 0.0.7

### Patch Changes

- Updated dependencies [[`a271edf`](https://github.com/ensdomains/ensjs/commit/a271edff8f06f7bdf41b9df2e98d47817ddd2b00)]:
  - @ensdomains/ensjs@4.2.3

## 0.0.6

### Patch Changes

- Fixed broken versioning

## 0.0.5

### Patch Changes

- Updated dependencies [[`6458e3d`](https://github.com/ensdomains/ensjs/commit/6458e3d869dc1b84f4acd9835d39ea97a3f6bc62)]:
  - @ensdomains/ensjs@4.2.2

## 0.0.4

### Patch Changes

- Updated dependencies []:
  - @ensdomains/ensjs@4.0.2

## 0.0.3

### Patch Changes

- [#209](https://github.com/ensdomains/ensjs/pull/209) [`927ab6e`](https://github.com/ensdomains/ensjs/commit/927ab6e4dc717159a2f670da3727c2ef24dac1fb) Thanks [@lucemans](https://github.com/lucemans)! - Sorted imports

## 0.0.2

### Patch Changes

- [#199](https://github.com/ensdomains/ensjs/pull/199) [`1c2aa83`](https://github.com/ensdomains/ensjs/commit/1c2aa83681a1be98f920e6eac57391c138712df7) Thanks [@lucemans](https://github.com/lucemans)! - Introduce @ensdomains/ensjs-react

- Updated dependencies [[`1c2aa83`](https://github.com/ensdomains/ensjs/commit/1c2aa83681a1be98f920e6eac57391c138712df7)]:
  - @ensdomains/ensjs@4.0.1
