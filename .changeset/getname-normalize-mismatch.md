---
"@ensdomains/ensjs": patch
---

`getName` now normalizes the returned name in the forward/reverse mismatch path (`allowMismatch: true`). Previously the name surfaced from a `ReverseAddressMismatch` was returned unnormalized, making normalization inconsistent with the matching path which already normalizes. All names returned from `getName` are now normalized via `@adraffy/ens-normalize` (WEB-533).
