---
"@ensdomains/ensjs": patch
---

commit: f1e004ab853c3c5a45814c6b9cabd8707d36ad3f

Send the v1 `createSubname`, `deleteSubname`, `setResolver` and `transferName` registry calls to `ensLegacyRegistry`. They targeted `ensRegistry`, which is the ENSv2 RootRegistry, so writes on unwrapped v1 names reverted.
