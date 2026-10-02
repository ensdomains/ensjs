---
"@ensdomains/ensjs": major
"@ensdomains/ensjs-abi": major
"@ensdomains/ensjs-react": major
"@ensdomains/ensjs-query-core": major
---

ENSjs v5: ENSv2 support.

- Add support for ENSv2 contracts (permissioned registries and resolvers, roles, migration, registration and renewal) alongside ENSv1
- Extract contract ABIs and addresses into the new `@ensdomains/ensjs-abi` package
- Group actions by contract and re-cut entrypoints to match the action groups
- Replace `graphql-request` with a plain fetch subgraph client
- Add `@ensdomains/ensjs-query-core` and migrate `@ensdomains/ensjs-react` to the v5 API; all packages are now versioned together
