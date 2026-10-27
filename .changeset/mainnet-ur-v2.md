---
"@ensdomains/ensjs": patch
---

Point mainnet `ensUniversalResolver` at the UniversalResolverV2 implementation until the security council upgrades the ManagedUniversalResolverProxy. A v1 resolver reports the `.eth` ENSV2Resolver mirror at the TLD for v2 names, so `findResolver` reads a name's own resolver as inherited; the v2 resolver returns it at the leaf.
