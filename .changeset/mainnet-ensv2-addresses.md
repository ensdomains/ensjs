---
"@ensdomains/ensjs": minor
---

Add the ENSv2 mainnet contract addresses, which were all `zeroAddress`, plus the mainnet `ensDefaultReverseRegistrar` and `ensDefaultReverseResolver`. Mainnet `ensUniversalResolver` now points at the ManagedUniversalResolverProxy, which can be upgraded to UniversalResolverV2 without a DAO vote.
