---
"@ensdomains/ensjs": patch
---

`bytesToPacket` now returns labels it can't represent as text (ones containing `.`, `[`, `]` or invalid UTF-8) as encoded labelhashes, so the decoded name always namehashes to the node the bytes encode. A label like `8436.eth` no longer decodes to `8436.eth.eth` ([#222](https://github.com/ensdomains/ensjs/issues/222)). It also keeps a leading byte order mark, and throws `InvalidDnsEncodedNameError` on truncated, unterminated or trailing-data input instead of returning a wrong name. `getWrapperName` inherits both fixes.
