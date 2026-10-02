# @ensdomains/ensjs

## 5.0.1

### Patch Changes

- [#362](https://github.com/ensdomains/ensjs/pull/362) [`583768f`](https://github.com/ensdomains/ensjs/commit/583768f1fb9d3acab8b19412358955dc13c17686) Thanks [@gomesalexandre](https://github.com/gomesalexandre)! - Bump `@ensdomains/address-encoder` to `1.1.4`, adding support for SUI (coin type 784) address records.

- [#294](https://github.com/ensdomains/ensjs/pull/294) [`0cb1a0b`](https://github.com/ensdomains/ensjs/commit/0cb1a0b239a72f5930cc1927d8b063a1dfa7dc11) Thanks [@madisoncarter1234](https://github.com/madisoncarter1234)! - Fix `checkPccBurned` returning the inverse result: it now returns `true` only when the `PARENT_CANNOT_CONTROL` fuse is burned.

- [#375](https://github.com/ensdomains/ensjs/pull/375) [`890c439`](https://github.com/ensdomains/ensjs/commit/890c4396dc9a24dbc63a25d9d45f00f1c28a3cf9) Thanks [@gomesalexandre](https://github.com/gomesalexandre)! - Unrecognised content hash bytes no longer throw: `isValidContentHash` returns `false`, `getRecords` skips the content hash instead of failing the whole call, and subgraph `ContenthashChanged` events are returned as undecoded.

- [#364](https://github.com/ensdomains/ensjs/pull/364) [`b634a3e`](https://github.com/ensdomains/ensjs/commit/b634a3e5b7de820df30a4cde5e27a1f58060e371) Thanks [@gomesalexandre](https://github.com/gomesalexandre)! - Fix `decodeFuses` omitting the unnamed parent fuses `0x2000000` through `0x80000000`, which caused burned fuses in that range to be reported as not burned.

- [#369](https://github.com/ensdomains/ensjs/pull/369) [`f153465`](https://github.com/ensdomains/ensjs/commit/f153465effa88e5221d8177b982143938fee6ba7) Thanks [@zoneguest](https://github.com/zoneguest)! - Declare `@ensdomains/dnsprovejs` as an optional peer dependency (`^0.5.4 || ^1.0.0`). `getDnsImportData` loads it at runtime, but 5.0.0 didn't declare it, so it could be missing or resolve to 0.5.1–0.5.3, whose DNS-over-HTTPS requests modern resolvers reject. Install it alongside ensjs if you use `getDnsImportData`.

- [#365](https://github.com/ensdomains/ensjs/pull/365) [`9575b44`](https://github.com/ensdomains/ensjs/commit/9575b440c4a1b46f17879bd7cef6798e648db396) Thanks [@gomesalexandre](https://github.com/gomesalexandre)! - Fix `getNameType('')` returning `'tld'` instead of `'root'`.
- Updated dependencies []:
  - @ensdomains/ensjs-abi@5.0.1

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
  - @ensdomains/ensjs-abi@5.0.0

## 4.3.1

### Patch Changes

- [#345](https://github.com/ensdomains/ensjs/pull/345) [`477befd`](https://github.com/ensdomains/ensjs/commit/477befdc26104501880219ca5028b333e3cf7886) Thanks [@v1rtl](https://github.com/v1rtl)! - `getName` now enforces normalization: it only returns a primary name if the value returned by reverse resolution is already in its normalised form, returning `null` otherwise (instead of silently coercing it). This mirrors viem's `getEnsName` behaviour (wevm/viem#4756) and brings v4 in line with v5 (WEB-533). The normalization check is applied to both the matching and `allowMismatch` paths.

## 4.3.0

### Minor Changes

- [#339](https://github.com/ensdomains/ensjs/pull/339) [`5248ffa`](https://github.com/ensdomains/ensjs/commit/5248ffa82f000050a5f703eefc8a93c836b8c151) Thanks [@TONresistor](https://github.com/TONresistor)! - Add adnl contenthash protocol

## 4.2.3

### Patch Changes

- [#332](https://github.com/ensdomains/ensjs/pull/332) [`a271edf`](https://github.com/ensdomains/ensjs/commit/a271edff8f06f7bdf41b9df2e98d47817ddd2b00) Thanks [@v1rtl](https://github.com/v1rtl)! - Update Universal Resolver address and ABI to the new canonical deployment at `0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe` on mainnet and Sepolia (#262). The new UR adds extra error variants surfaced through `universalResolverErrors`; consumer code that already routes through `getRecords`, `getName`, etc. picks this up automatically.

## 4.2.2

### Patch Changes

- [#301](https://github.com/ensdomains/ensjs/pull/301) [`6458e3d`](https://github.com/ensdomains/ensjs/commit/6458e3d869dc1b84f4acd9835d39ea97a3f6bc62) Thanks [@TateB](https://github.com/TateB)! - Fixed custom error handling in getRecords

## 4.0.2

### Patch Changes

- Fix pagination bug for names with identical createdAt and expiryDate in getNamesForAddress

## 4.0.1

### Patch Changes

- [#199](https://github.com/ensdomains/ensjs/pull/199) [`1c2aa83`](https://github.com/ensdomains/ensjs/commit/1c2aa83681a1be98f920e6eac57391c138712df7) Thanks [@lucemans](https://github.com/lucemans)! - Introduce @ensdomains/ensjs-react
