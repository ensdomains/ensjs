[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [public/v2](../api.md) / GetNameRolesAccountsReturnType

# Type Alias: GetNameRolesAccountsReturnType

> **GetNameRolesAccountsReturnType** = `Map`\<`Address`, keyof *typeof* `registryRoles`[]\>

Defined in: packages/ensjs/src/actions/public/v2/registry/getNameRolesAccounts.ts:30

The decoded roles come from `registryRoles`, whose keys already include the
`_ADMIN` variants — the same type `getNameRolesForAccount` returns. The
previous `RoleName<readonly string[]>` instantiated the generic with its own
constraint, which widens to `string` and left callers casting.
