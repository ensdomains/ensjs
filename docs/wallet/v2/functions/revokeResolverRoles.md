[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v2](../api.md) / revokeResolverRoles

# Function: revokeResolverRoles()

> **revokeResolverRoles**\<`chain`, `account`, `chainOverride`\>(`client`, `params`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/v2/resolver/revokeResolverRoles.ts:176

Revoke roles on a PermissionedResolver (V2).

- **`'root'`**: revoke roles held on the root resource.
- **`'setter'`**: revoke the setter's role for one argument (mirror of the
  `'setter'` grant); the resource is computed from the argument.
- **`'resource'`**: revoke roles on a raw EAC resource, for callers that
  read the resource from `EACRolesChanged` events.

The caller must hold the admin variant of each role on root or on the
resource.

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

`RevokeResolverRolesParameters`\<`chain`, `account`, `chainOverride`\>

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. RevokeResolverRolesReturnType

## Examples

```ts
// Revoke roles globally
const hash = await revokeResolverRoles(walletClient, {
  resolverAddress: '0x...',
  targetAccount: '0xOTHER',
  scope: 'root',
  roles: ['ROLE_LINK'],
})
```

```ts
// Revoke ROLE_SET_TEXT for the `avatar` key
const hash = await revokeResolverRoles(walletClient, {
  resolverAddress: '0x...',
  targetAccount: '0xOTHER',
  scope: 'setter',
  setter: { kind: 'text', key: 'avatar' },
})
```
