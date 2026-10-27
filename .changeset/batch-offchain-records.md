---
"@ensdomains/ensjs": patch
---

`resolveNameData` (and so `getRecords`) asks a CCIP-Read resolver for every record in one gateway request. The UniversalResolver splits a multicall into one request per record unless the resolver advertises ERC-7996 `RESOLVE_MULTICALL`, so for an offchain name that does not, the batch is sent straight to the ENSIP-10 resolver behind any composite resolver, falling back to the UniversalResolver when it is rejected. Onchain names are read with the same single call as before.
