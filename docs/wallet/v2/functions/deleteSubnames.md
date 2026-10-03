[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v2](../api.md) / deleteSubnames

# Function: deleteSubnames()

> **deleteSubnames**\<`chain`, `account`, `chainOverride`\>(`client`, `parameters`): `Promise`\<`DeleteSubnamesReturnType`\>

Defined in: packages/ensjs/src/actions/wallet/v2/registry/deleteSubnames.ts:88

Deletes multiple subnames by calling `unregister()` for each one on the parent registry.

In ENSv2 there is no batch unregister — each subname requires a separate
`unregister()` call. This function sends them sequentially (each tx is awaited
before the next is signed) and returns their hashes in input order. The caller
must have ROLE_UNREGISTER on each name's resource or on ROOT_RESOURCE.

For REGISTERED names this burns the ERC1155 token and invalidates roles;
RESERVED names are unregistered without a burn. In both cases the name becomes
AVAILABLE. Resolver records, linked subregistries, and deeper subnames are not
cleaned up automatically.

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

DeleteSubnamesParameters

#### labels

`string`[]

The labels of the subnames to delete

#### registryAddress

`` `0x${string}` ``

The parent registry address

## Returns

`Promise`\<`DeleteSubnamesReturnType`\>

Array of transaction hashes. DeleteSubnamesReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { deleteSubnames } from '@ensdomains/ensjs/wallet/v2'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: mainnet,
  transport: custom(window.ethereum),
})
const hashes = await deleteSubnames(wallet, {
  registryAddress: '0x...', // parent registry
  labels: ['sub1', 'sub2', 'sub3'],
})
// ['0x...', '0x...', '0x...']
```
