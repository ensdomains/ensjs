---
"@ensdomains/ensjs": patch
---

Fix `decodeFuses` omitting the unnamed parent fuses `0x2000000` through `0x80000000`, which caused burned fuses in that range to be reported as not burned.
