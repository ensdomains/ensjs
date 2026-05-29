---
"@ensdomains/ensjs": patch
---

Update Universal Resolver address and ABI to the new canonical deployment at `0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe` on mainnet and Sepolia (#262). The new UR adds extra error variants surfaced through `universalResolverErrors`; consumer code that already routes through `getRecords`, `getName`, etc. picks this up automatically.
