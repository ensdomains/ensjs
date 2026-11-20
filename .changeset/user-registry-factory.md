---
"@ensdomains/ensjs": minor
---

Add `ensUserRegistryFactory`, the VerifiableFactory that deploys UserRegistry proxies: `0x6B9BCAAd92b05ED24D3e01950048B73E8633053F` on mainnet, and the existing `0xDa70306C98E97eCe36F997a21368e53298572991` on Sepolia. Point mainnet `ensUserRegistryImpl` at `0x3269b830b61b3186Dc6d2f57Cab118E2FBC3E2df`. `ensVerifiableFactory` is unchanged; HCAs and PermissionedResolvers stay on it.
