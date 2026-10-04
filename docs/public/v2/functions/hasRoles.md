[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [public/v2](../api.md) / hasRoles

# Function: hasRoles()

> **hasRoles**(`client`, `params`): `Promise`\<`boolean`\>

Defined in: packages/ensjs/src/actions/public/v2/accessControl/hasRoles.ts:139

Check if an account has specific roles.

Supports four modes based on the parameters passed:

**Registry mode** (pass `registryAddress` + `label`):
Check roles on a registry for a specific name.

**Registry root mode** (pass `registryAddress` only):
Check registry-wide roles at the root resource (resource = 0).

**Resolver root mode** (pass `resolverAddress` only):
Check root-level roles on a resolver (global, any name/record).

**Resolver mode** (pass `resolverAddress` + `resource`):
Check roles on a resolver for a setter-argument resource (see
`computeResolverResource`). Resolver roles are never scoped to a name.

## Parameters

### client

`Client`

Client

### params

`HasRolesParameters`

## Returns

`Promise`\<`boolean`\>

Boolean indicating if the account has the roles.

## Examples

```ts
// Registry mode - check registry roles for a name
const hasRole = await hasRoles(client, {
  registryAddress: '0x...',
  label: 'example',
  roles: ['ROLE_SET_SUBREGISTRY'],
  account: '0x...',
})
```

```ts
// Registry root mode - check registry-wide root roles
const isAdmin = await hasRoles(client, {
  registryAddress: '0x...',
  roles: ['ROLE_REGISTRAR_ADMIN'],
  account: '0x...',
})
```

```ts
// Resolver root mode - check global resolver roles
const canLink = await hasRoles(client, {
  resolverAddress: '0x...',
  roles: ['ROLE_LINK'],
  account: '0x...',
})
```

```ts
// Resolver mode - check a role scoped to one setter argument. The contract
// ORs root roles into the check, so this also passes for root holders.
const canSetAvatar = await hasRoles(client, {
  resolverAddress: '0x...',
  resource: computeResolverResource({ kind: 'text', key: 'avatar' }),
  roles: ['ROLE_SET_TEXT'],
  account: '0x...',
})
```
