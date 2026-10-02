---
"@ensdomains/ensjs": patch
---

Declare `@ensdomains/dnsprovejs` as an optional peer dependency (`^0.5.4 || ^1.0.0`). `getDnsImportData` loads it at runtime, but 5.0.0 didn't declare it, so it could be missing or resolve to 0.5.1–0.5.3, whose DNS-over-HTTPS requests modern resolvers reject. Install it alongside ensjs if you use `getDnsImportData`.
