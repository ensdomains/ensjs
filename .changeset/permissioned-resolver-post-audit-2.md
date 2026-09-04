---
'@ensdomains/ensjs-abi': major
'@ensdomains/ensjs': major
---

Target the post-audit-2 `PermissionedResolver` (contracts-v2 PR #417).

- `@ensdomains/ensjs-abi/v2/permissionedResolver`: name-based setter snippets (`setAddress(name, ...)`, `setText(name, ...)`, ...), `multicall`, `resolve`, `linkToNode` / `linkToRecord` / `getRecordId` / `getRecordCount`, `grantSetterRoles` / `decodeSetter` / `roleCount`, `initialize(Grant[] grants, bytes[] calls)`, the `Linked` / `*Updated` / `ResourceArgument` events. Removed: `setAlias` / `getAlias`, `clearRecords`, `multicallWithNodeCheck`, the `authorize*Roles` family. `revokeRoles` is a real call again. `eacGrantInitializeSnippet` (`initialize(Grant[])`) replaces the `initialize(address, uint256)` form for `UserRegistry` proxies.
- `@ensdomains/ensjs/wallet/v2`: `setAlias` / `deleteAlias` become `linkToNode` / `linkToRecord` (`linkToRecord` with no record id unlinks, replacing `clearRecords`); new name-based `setRecords`; `grantResolverRoles` / `revokeResolverRoles` scopes are `root` and `setter` (plus `resource` for revokes), the per-name scope is gone; new `deployPermissionedResolver`; `deployVerifiableProxy` and `deploySubregistry` default to the `Grant[]` initializer.
- `@ensdomains/ensjs/utils/v2`: resolver roles follow the new bit layout (`ROLE_SET_ADDRESS`, `ROLE_SET_DATA`, `ROLE_LINK`, `ROLE_CAN_NAME`; no `PUBKEY` / `ALIAS` / `CLEAR`) and include admin variants; `computeResolverResource` takes a setter scope (`{ kind: 'text', key }`, `{ kind: 'address', coinType }`, ...) instead of `(node, part)`; `encodeResolverSetterScope`, `decodeResolverRoleBitmap`, and the name-based record parameter builders are new.
- `getResolverName` reads through `resolve` since the resolver has no `name(node)` getter.
