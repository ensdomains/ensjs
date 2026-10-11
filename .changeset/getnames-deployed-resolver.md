---
"@ensdomains/ensjs": patch
"@ensdomains/ensjs-abi": patch
---

Fix `getNames`. It called `resolveNames(address[])`, which the deployed DefaultReverseResolvers don't have; they take `resolveNames(address[], uint8 perPage)`. `defaultReverseResolverResolveNamesSnippet` now matches the deployed signature. Sepolia's `ensDefaultReverseResolver` now points at the official resolver (`0x9DC6…`) instead of a redeploy that returned empty names.
