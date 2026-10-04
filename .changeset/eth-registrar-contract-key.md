---
"@ensdomains/ensjs": patch
---

Fix `commitName` and `registerName` looking up the registrar as `ethRegistrar` instead of `ensEthRegistrar`, which made them throw on chains from `addEnsContracts`/`extendChainWithEns`.
