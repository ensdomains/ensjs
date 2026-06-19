# @ensdomains/ensjs

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
