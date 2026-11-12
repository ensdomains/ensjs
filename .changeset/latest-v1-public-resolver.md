---
"@ensdomains/ensjs": patch
---

Point `ensPublicResolver` at the newest ENSv1 PublicResolver: `0xF29100983E058B709F3D539b0c765937B804AC15` on mainnet and `0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5` on Sepolia. It adds ENSIP-19 default addresses, which L2 and default primary names rely on. `importDnsName`, `wrapName`, `createSubname` and `setPrimaryName` use it as their default resolver.
