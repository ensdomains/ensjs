[**@ensdomains/ensjs**](../../../api.md)

***

[@ensdomains/ensjs](../../../api.md) / [wallet/v2](../api.md) / linkToNode

# Function: linkToNode()

> **linkToNode**\<`chain`, `account`, `chainOverride`\>(`client`, `parameters`): `Promise`\<`` `0x${string}` ``\>

Defined in: packages/ensjs/src/actions/wallet/v2/resolver/linkToNode.ts:117

Links a name to the record another name currently uses on a
PermissionedResolver (V2), so both names serve the same records.

Requires `ROLE_LINK` on the resolver's root resource. Reverts with
`InvalidRecord` if the target name has no record on this resolver yet.

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

LinkToNodeParameters

#### resolverAddress

`` `0x${string}` ``

The resolver address

#### sourceName

`string`

The name that should start serving the target's records

#### targetName

`string`

The name whose current record the source should use

## Returns

`Promise`\<`` `0x${string}` ``\>

Transaction hash. LinkToNodeReturnType

## Example

```ts
import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import { linkToNode } from '@ensdomains/ensjs/wallet/v2'

const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
const wallet = createWalletClient({
  account,
  chain: mainnet,
  transport: custom(window.ethereum),
})
const hash = await linkToNode(wallet, {
  sourceName: 'alias.eth',
  targetName: 'target.eth',
  resolverAddress: '0x...',
})
// 0x...
```
