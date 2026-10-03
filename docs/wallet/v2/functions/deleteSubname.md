[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v2](../api.md) / deleteSubname

# Function: deleteSubname()

> **deleteSubname**\<`chain`, `account`, `chainOverride`\>(`client`, `parameters`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/v2/registry/deleteSubname.ts:114

Deletes a subname by calling `unregister()` on the parent registry.

In ENSv2, subnames are managed by their parent registry (PermissionedRegistry).
The caller must have ROLE_UNREGISTER on the name's resource or on ROOT_RESOURCE.
If the name is REGISTERED, this burns the ERC1155 token and invalidates all
roles on its resource (via an `eacVersionId` + `tokenVersionId` bump).
If the name is RESERVED, no burn or version bump occurs. In both cases the
name becomes AVAILABLE immediately.

Note: unregistering does not clear resolver records, the linked subregistry,
or any deeper subnames — those must be cleaned up separately.

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

### parameters

DeleteSubnameParameters

#### label

`string`

The label of the subname to delete (e.g. "sub" for sub.example.eth)

#### registryAddress

`` `0x${string}` ``

The parent registry address that contains the subname

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. DeleteSubnameReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { deleteSubname } from '@ensdomains/ensjs/wallet/v2'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: mainnet,
  transport: custom(window.ethereum),
})
const hash = await deleteSubname(wallet, {
  registryAddress: '0x...', // parent registry (e.g. example.eth's UserRegistry)
  label: 'sub',             // deletes sub.example.eth
})
// 0x...
```
