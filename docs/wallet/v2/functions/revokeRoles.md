[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v2](../api.md) / revokeRoles

# Function: revokeRoles()

> **revokeRoles**\<`chain`, `account`, `chainOverride`\>(`client`, `options`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/v2/accessControl/revokeRoles.ts:148

Revokes roles from an account in the Enhanced Access Control contract.

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

Client

### options

RevokeRolesParameters

#### account

`` `0x${string}` `` & `BasicWriteContractParameters`\<`chain`, `account`, `chainOverride`\>\[`"account"`\]

The account to revoke roles from

#### registryAddress

`` `0x${string}` ``

The registry address

#### resource

`bigint`

The resource to revoke roles within (use 0 for ROOT_RESOURCE)

#### roles

(`"ROLE_CAN_TRANSFER_ADMIN"` \| `"ROLE_REGISTER_RESERVED"` \| `"ROLE_REGISTER_RESERVED_ADMIN"` \| `"ROLE_REGISTRAR"` \| `"ROLE_REGISTRAR_ADMIN"` \| `"ROLE_RENEW"` \| `"ROLE_RENEW_ADMIN"` \| `"ROLE_SET_PARENT"` \| `"ROLE_SET_PARENT_ADMIN"` \| `"ROLE_SET_RESOLVER"` \| `"ROLE_SET_RESOLVER_ADMIN"` \| `"ROLE_SET_SUBREGISTRY"` \| `"ROLE_SET_SUBREGISTRY_ADMIN"` \| `"ROLE_SET_URI"` \| `"ROLE_SET_URI_ADMIN"` \| `"ROLE_UNREGISTER"` \| `"ROLE_UNREGISTER_ADMIN"` \| `"ROLE_UPGRADE"` \| `"ROLE_UPGRADE_ADMIN"` \| `"ROLE_WAS_RESERVED"`)[]

The roles to revoke

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. RevokeRolesReturnType

## Examples

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { addEnsContracts } from '@ensdomains/ensjs'
import { revokeRoles } from '@ensdomains/ensjs/wallet/v2'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: addEnsContracts(mainnet),
  transport: custom(window.ethereum),
})
const hash = await revokeRoles(wallet, {
  registryAddress: '0x...',
  roles: ['ROLE_SET_RESOLVER'],
  account: '0x...',
  resource: 1n,
})
// 0x...
```

```ts
// Revoke root roles (resource = 0)
const hash = await revokeRoles(wallet, {
  registryAddress: '0x...',
  roles: ['ROLE_SET_RESOLVER'],
  account: '0x...',
  resource: 0n,
})
// 0x...
```
