---
"@ensdomains/ensjs": minor
---

`getOwner`, `getResolver`, `getRecords`, `getName`, `getExpiry`, `getPrice`, `getAddressRecord`, `getTextRecord`, `getContentHashRecord`, `getAbiRecord`, `getWrapperData`, `getSupportedInterfaces` and `getAvailable` now accept an optional `blockNumber` for historical reads, matching viem's `CallParameters['blockNumber']`. For `getRecords`, `getName`, `getAddressRecord`, `getTextRecord`, `getContentHashRecord` and `getAbiRecord` - which resolve through the ENS Universal Resolver's `resolve()`/`reverse()` - `blockNumber` only pins the on-chain call: CCIP-read/offchain gateway data (e.g. wildcard-resolved names) is not pinned, since viem's `call` action doesn't forward `blockNumber` through its offchain-lookup retry.

`blockNumber` is not currently supported through `batch()`: batching per-item historical reads would silently fall back to the latest block, so passing `blockNumber` to a batched function now throws `FunctionNotBatchableError` instead of quietly ignoring it.
