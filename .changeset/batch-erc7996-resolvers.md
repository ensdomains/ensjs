---
"@ensdomains/ensjs": patch
---

`resolveNameData` (and so `getRecords`) sends the batch straight to an offchain name's ENSIP-10 resolver even when it advertises ERC-7996 `RESOLVE_MULTICALL`. The mainnet UniversalResolver still splits the batch per record for such a resolver, so `getRecords` made one gateway request per record.
