---
"@ensdomains/ensjs": patch
---

Unrecognised content hash bytes no longer throw: `isValidContentHash` returns `false`, `getRecords` skips the content hash instead of failing the whole call, and subgraph `ContenthashChanged` events are returned as undecoded.
