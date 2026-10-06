---
"@ensdomains/ensjs": minor
---

Add an optional `blockNumber` parameter to `getResolver`, `getName`, `getNames`, `getRecords`, `getTextRecord`, `getAddressRecord`, `getContentHashRecord`, `getAbiRecord` and `getSupportedInterfaces` for historical reads. CCIP-read (offchain) responses are not pinned to the block, since viem's offchain-lookup retry does not forward `blockNumber`.
