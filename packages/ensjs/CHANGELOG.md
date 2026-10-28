# @ensdomains/ensjs

## 5.2.9

### Patch Changes

- [#438](https://github.com/ensdomains/ensjs/pull/438) [`fcb2052`](https://github.com/ensdomains/ensjs/commit/fcb2052813ed0b8829b9cc0ee6e8c0ff036cf452) Thanks [@Malak67](https://github.com/Malak67)! - Point mainnet `ensUserRegistryImpl` at the redeployed UserRegistry whose `canUpgradeFrom` rejects every upgrade.

## 5.2.8

### Patch Changes

- [#436](https://github.com/ensdomains/ensjs/pull/436) [`f9cf0c0`](https://github.com/ensdomains/ensjs/commit/f9cf0c0331001c56be5ebfc6c7a3e1844d109347) Thanks [@v1rtl](https://github.com/v1rtl)! - `resolveNameData` (and so `getRecords`) asks a CCIP-Read resolver for every record in one gateway request. The UniversalResolver splits a multicall into one request per record unless the resolver advertises ERC-7996 `RESOLVE_MULTICALL`, so for an offchain name that does not, the batch is sent straight to the ENSIP-10 resolver behind any composite resolver, falling back to the UniversalResolver when it is rejected. Onchain names are read with the same single call as before.

- [#435](https://github.com/ensdomains/ensjs/pull/435) [`55d7ace`](https://github.com/ensdomains/ensjs/commit/55d7ace6606bd704f038c6107f2d9b441d53208c) Thanks [@v1rtl](https://github.com/v1rtl)! - Point mainnet `ensUniversalResolver` at the long-lived top proxy `0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe`, matching Sepolia. The security council upgrade now routes it through the ManagedUniversalResolverProxy to UniversalResolverV2.
- Updated dependencies [[`97354a4`](https://github.com/ensdomains/ensjs/commit/97354a4a3be44f79646da8a13be0ec312033df15)]:
  - @ensdomains/ensjs-abi@5.0.5

## 5.2.7

### Patch Changes

- [#434](https://github.com/ensdomains/ensjs/pull/434) [`cab3541`](https://github.com/ensdomains/ensjs/commit/cab35411f3862a28561556941e756813af5e1409) Thanks [@v1rtl](https://github.com/v1rtl)! - Point mainnet `ensUniversalResolver` at the UniversalResolverV2 implementation until the security council upgrades the ManagedUniversalResolverProxy. A v1 resolver reports the `.eth` ENSV2Resolver mirror at the TLD for v2 names, so `findResolver` reads a name's own resolver as inherited; the v2 resolver returns it at the leaf.

- [#432](https://github.com/ensdomains/ensjs/pull/432) [`61a7960`](https://github.com/ensdomains/ensjs/commit/61a79601a85e711d383bddb9ecd6830db0b253e5) Thanks [@v1rtl](https://github.com/v1rtl)! - Point mainnet `ensUserRegistryImpl`, `ensLockedMigrationController` and `ensMigrationHelper` at the contracts redeployed on 2026-10-26.

## 5.2.6

### Patch Changes

- [#430](https://github.com/ensdomains/ensjs/pull/430) [`2db53bb`](https://github.com/ensdomains/ensjs/commit/2db53bb9963bc594237a3512e1ebe5727f7b7119) Thanks [@v1rtl](https://github.com/v1rtl)! - Point mainnet `ensLockedMigrationController` and `ensMigrationHelper` at the contracts redeployed on 2026-10-23, replacing the archived ones.

## 5.2.5

### Patch Changes

- [#427](https://github.com/ensdomains/ensjs/pull/427) [`b04dba5`](https://github.com/ensdomains/ensjs/commit/b04dba5c208f9ffd6b330073926a1c87ee9ca4c0) Thanks [@Malak67](https://github.com/Malak67)! - Add `setParent` to `wallet/v2`, and `userRegistrySetParentSnippet` for `setParent(address,string)`, to set a registry's canonical parent after deploying it.

- [#426](https://github.com/ensdomains/ensjs/pull/426) [`885dca3`](https://github.com/ensdomains/ensjs/commit/885dca3d530fc0359bceb1db8e0931e7f3936e25) Thanks [@bigint](https://github.com/bigint)! - Upgrade address-encoder to 2.0.1 and use cborg directly for ABI encoding and decoding, retaining the byte, nesting, and item limits and optional-record failure handling.
- Updated dependencies [[`b04dba5`](https://github.com/ensdomains/ensjs/commit/b04dba5c208f9ffd6b330073926a1c87ee9ca4c0)]:
  - @ensdomains/ensjs-abi@5.0.4

## 5.2.4

### Patch Changes

- [#423](https://github.com/ensdomains/ensjs/pull/423) [`1c5087f`](https://github.com/ensdomains/ensjs/commit/1c5087fe08ee4af662632e606b59bd37737c7fc1) Thanks [@v1rtl](https://github.com/v1rtl)! - Update mainnet addresses for `ensUniversalHelper`, `ensLockedMigrationController`, and `ensMigrationHelper` to match the latest ENSv2 mainnet deployment.

## 5.2.3

### Patch Changes

- [#421](https://github.com/ensdomains/ensjs/pull/421) [`0b11947`](https://github.com/ensdomains/ensjs/commit/0b119470a5dc5ac88f3008b6836abf1f730b010b) Thanks [@Malak67](https://github.com/Malak67)! - Send the v1 `createSubname`, `deleteSubname`, `setResolver` and `transferName` registry calls to `ensLegacyRegistry`. They targeted `ensRegistry`, which is the ENSv2 .eth registry, so writes on unwrapped v1 names reverted.

## 5.2.2

### Patch Changes

- [#417](https://github.com/ensdomains/ensjs/pull/417) [`b48ec00`](https://github.com/ensdomains/ensjs/commit/b48ec002cc86d7e8e892b78d9076b457e674c133) Thanks [@v1rtl](https://github.com/v1rtl)! - `bytesToPacket` now returns labels it can't represent as text (ones containing `.`, `[`, `]` or invalid UTF-8) as encoded labelhashes, so the decoded name always namehashes to the node the bytes encode. A label like `8436.eth` no longer decodes to `8436.eth.eth` ([#222](https://github.com/ensdomains/ensjs/issues/222)). It also keeps a leading byte order mark, and throws `InvalidDnsEncodedNameError` on truncated, unterminated or trailing-data input instead of returning a wrong name. `getWrapperName` inherits both fixes.

- [#415](https://github.com/ensdomains/ensjs/pull/415) [`489dc2c`](https://github.com/ensdomains/ensjs/commit/489dc2c5c159e7f791569391d4cb580c8c6dc397) Thanks [@Chakravarthy7102](https://github.com/Chakravarthy7102)! - Add `getIsEmancipated` to `public/v2`, and `permissionedRegistryIsEmancipatedSnippet` and `permissionedRegistryUnsafeTransferSnippet` for `PermissionedRegistry.isEmancipated()` and `unsafeTransfer(address,uint256,bytes)`.
- Updated dependencies [[`489dc2c`](https://github.com/ensdomains/ensjs/commit/489dc2c5c159e7f791569391d4cb580c8c6dc397)]:
  - @ensdomains/ensjs-abi@5.0.3

## 5.2.1

### Patch Changes

- [#407](https://github.com/ensdomains/ensjs/pull/407) [`cff4ebf`](https://github.com/ensdomains/ensjs/commit/cff4ebf0decc417f9c7bfcfa8a20e2a66bc5ff36) Thanks [@v1rtl](https://github.com/v1rtl)! - Update the mainnet `ensUniversalHelper`, `ensEthRegistrar`, `ensEthRenewerV1`, `ensLockedMigrationController` and `ensMigrationHelper` addresses to their ENSv2 redeployments. The previous addresses pointed at superseded instances, and only the new `ensEthRenewerV1` holds `ROLE_RENEW` on the ETH registry.

## 5.2.0

### Minor Changes

- [#402](https://github.com/ensdomains/ensjs/pull/402) [`cd12e11`](https://github.com/ensdomains/ensjs/commit/cd12e11dcaf481e4ebe7669ea95263f076b5d0bd) Thanks [@v1rtl](https://github.com/v1rtl)! - Add the ENSv2 mainnet contract addresses, which were all `zeroAddress`, plus the mainnet `ensDefaultReverseRegistrar` and `ensDefaultReverseResolver`. Mainnet `ensUniversalResolver` now points at the ManagedUniversalResolverProxy, which can be upgraded to UniversalResolverV2 without a DAO vote.

- [#400](https://github.com/ensdomains/ensjs/pull/400) [`bc21429`](https://github.com/ensdomains/ensjs/commit/bc214296fafc7ccb1ec75d1d4575f3b97150c1df) Thanks [@v1rtl](https://github.com/v1rtl)! - Add an optional `blockNumber` parameter to `getResolver`, `getName`, `getNames`, `getRecords`, `getTextRecord`, `getAddressRecord`, `getContentHashRecord`, `getAbiRecord` and `getSupportedInterfaces` for historical reads. CCIP-read (offchain) responses are not pinned to the block, since viem's offchain-lookup retry does not forward `blockNumber`.

### Patch Changes

- [#402](https://github.com/ensdomains/ensjs/pull/402) [`1f593c4`](https://github.com/ensdomains/ensjs/commit/1f593c47bcf240976b489c2b11a6adb095a09605) Thanks [@v1rtl](https://github.com/v1rtl)! - Fix `getNames`. It called `resolveNames(address[])`, which the deployed DefaultReverseResolvers don't have; they take `resolveNames(address[], uint8 perPage)`. `defaultReverseResolverResolveNamesSnippet` now matches the deployed signature. Sepolia's `ensDefaultReverseResolver` now points at the official resolver (`0x9DC6…`) instead of a redeploy that returned empty names.
- Updated dependencies [[`1f593c4`](https://github.com/ensdomains/ensjs/commit/1f593c47bcf240976b489c2b11a6adb095a09605)]:
  - @ensdomains/ensjs-abi@5.0.2

## 5.1.0

### Minor Changes

- [#395](https://github.com/ensdomains/ensjs/pull/395) [`7afeee0`](https://github.com/ensdomains/ensjs/commit/7afeee0f663a747aa72d16fe4c29bff349619f6a) Thanks [@v1rtl](https://github.com/v1rtl)! - Rename `addEnsL1Contracts` to `addEnsContracts`. `addEnsL1Contracts` is still exported as a deprecated alias.

### Patch Changes

- [#395](https://github.com/ensdomains/ensjs/pull/395) [`d4ff853`](https://github.com/ensdomains/ensjs/commit/d4ff853df06d7f6d641940009d0e517b0a33c899) Thanks [@v1rtl](https://github.com/v1rtl)! - Fix `addEnsContracts` setting `chain.subgraphs` to the contract map instead of the ENS subgraph URL, which made subgraph actions fail with chains built by it.

- [#399](https://github.com/ensdomains/ensjs/pull/399) [`252bc72`](https://github.com/ensdomains/ensjs/commit/252bc727f729fa8841e8125a011dd6323f572b62) Thanks [@bigint](https://github.com/bigint)! - Validate CBOR ABI records with byte, nesting, and item limits before decoding to prevent malformed records from hanging callers. Preserve other profile records when optional ABI decoding fails, including the direct resolver multicall path.

- [#396](https://github.com/ensdomains/ensjs/pull/396) [`38ba18f`](https://github.com/ensdomains/ensjs/commit/38ba18f3d0a7b50f4c9f0c0c32a409205f2ac272) Thanks [@v1rtl](https://github.com/v1rtl)! - Fix `commitName` and `registerName` looking up the registrar as `ethRegistrar` instead of `ensEthRegistrar`, which made them throw on chains from `addEnsContracts`/`extendChainWithEns`.

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
