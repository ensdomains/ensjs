[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v2](../api.md) / grantResolverRoles

# Function: grantResolverRoles()

> **grantResolverRoles**\<`chain`, `account`, `chainOverride`\>(`client`, `params`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/v2/resolver/grantResolverRoles.ts:164

Grant roles on a PermissionedResolver (V2).

Roles are never scoped to a name; a resolver is already per account. The
`scope` parameter picks between:

- **`'root'`**: grant roles on the root resource, covering every name and
  every record of those types. The caller must hold the admin variant of
  each role on root.

- **`'setter'`**: grant one setter's role for a single argument (`setAddress`
  for one coin type, `setText` for one text key, `setData`, `setABI`,
  `setInterface`) across every name. The caller must hold that role's admin
  variant on root or on the argument's resource.

## Type Parameters

### chain

`chain` *extends* `Chain`

### account

`account` *extends* `Account`

### chainOverride

`chainOverride` *extends* `Chain` \| `undefined`

## Parameters

### client

`Client`\<`Transport`, `chain`, `account`\>

Wallet client

### params

`GrantResolverRolesParameters`\<`chain`, `account`, `chainOverride`\>

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. GrantResolverRolesReturnType

## Examples

```ts
// Grant roles globally
const hash = await grantResolverRoles(walletClient, {
  resolverAddress: '0x...',
  targetAccount: '0xOTHER',
  scope: 'root',
  roles: ['ROLE_SET_TEXT', 'ROLE_SET_ADDRESS'],
})
```

```ts
// Grant ROLE_SET_TEXT for the `avatar` key only
const hash = await grantResolverRoles(walletClient, {
  resolverAddress: '0x...',
  targetAccount: '0xOTHER',
  scope: 'setter',
  setter: { kind: 'text', key: 'avatar' },
})
```

```ts
// Grant ROLE_SET_ADDRESS for coin type 60 only
const hash = await grantResolverRoles(walletClient, {
  resolverAddress: '0x...',
  targetAccount: '0xOTHER',
  scope: 'setter',
  setter: { kind: 'address', coinType: 60n },
})
```
