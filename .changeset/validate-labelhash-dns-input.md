---
"@ensdomains/ensjs": patch
---

Harden handling of untrusted input: `decodeLabelhash` now throws if the encoded labelhash isn't valid hex, `getDecodedName` passes labelhashes as GraphQL variables instead of interpolating them into the query, `getDnsTxtRecords` URL-encodes the name in the DNS-over-HTTPS request, and `checkIsDecrypted` correctly detects encoded labels when given an array.
