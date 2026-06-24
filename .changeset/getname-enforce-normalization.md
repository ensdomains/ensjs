---
"@ensdomains/ensjs": patch
---

`getName` now enforces normalization: it only returns a primary name if the value returned by reverse resolution is already in its normalised form, returning `null` otherwise (instead of silently coercing it). This mirrors viem's `getEnsName` behaviour (wevm/viem#4756) and brings v4 in line with v5 (WEB-533). The normalization check is applied to both the matching and `allowMismatch` paths.
