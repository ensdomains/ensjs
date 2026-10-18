---
"@ensdomains/ensjs": patch
---

commit: 0b119470a5dc5ac88f3008b6836abf1f730b010b

Send the v1 `createSubname`, `deleteSubname`, `setResolver` and `transferName` registry calls to `ensLegacyRegistry`. They targeted `ensRegistry`, which is the ENSv2 .eth registry, so writes on unwrapped v1 names reverted.
