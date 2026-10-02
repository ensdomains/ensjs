---
"@ensdomains/ensjs": patch
---

Fix `checkPccBurned` returning the inverse result: it now returns `true` only when the `PARENT_CANNOT_CONTROL` fuse is burned.
