---
"@ensdomains/ensjs": patch
---

commit: cff4ebf0decc417f9c7bfcfa8a20e2a66bc5ff36

Update the mainnet `ensUniversalHelper`, `ensEthRegistrar`, `ensEthRenewerV1`, `ensLockedMigrationController` and `ensMigrationHelper` addresses to their ENSv2 redeployments. The previous addresses pointed at superseded instances, and only the new `ensEthRenewerV1` holds `ROLE_RENEW` on the ETH registry.
