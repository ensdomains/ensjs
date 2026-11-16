---
"@ensdomains/ensjs": patch
---

Fix `getName` sending coin type `0x80000001` instead of `60` for `chainId: 1`, which returned `null` for mainnet primary names. `chainId: 0` and `coinType: 0` are no longer treated as missing and replaced with `60`.
