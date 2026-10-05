---
"@ensdomains/ensjs": patch
---

Validate CBOR ABI records with byte, nesting, and item limits before decoding to prevent malformed records from hanging callers. Preserve other profile records when optional ABI decoding fails, including the direct resolver multicall path.
