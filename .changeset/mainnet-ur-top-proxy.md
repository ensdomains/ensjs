---
"@ensdomains/ensjs": patch
---

Point mainnet `ensUniversalResolver` at the long-lived top proxy `0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe`, matching Sepolia. The security council upgrade now routes it through the ManagedUniversalResolverProxy to UniversalResolverV2.
